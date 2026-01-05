const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Helper function to generate slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

// Helper function to log audit
const logAudit = async (adminId, action, entity, entityId, oldValues = null, newValues = null, req = null) => {
  try {
    await prisma.auditLog.create({
      data: {
        adminId,
        action,
        entity,
        entityId,
        oldValues: oldValues ? JSON.stringify(oldValues) : null,
        newValues: newValues ? JSON.stringify(newValues) : null,
        ipAddress: req?.ip || null,
        userAgent: req?.get('User-Agent') || null,
        categoryId: entity === 'Category' ? entityId : null,
      }
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
};

// Get all categories (public) - hierarchical structure
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { 
        status: 'ACTIVE',
        isDeleted: false,
        parentId: null // Only root categories
      },
      include: {
        _count: {
          select: { products: true }
        },
        children: {
          where: { 
            status: 'ACTIVE',
            isDeleted: false 
          },
          include: {
            _count: {
              select: { products: true }
            },
            children: {
              where: { 
                status: 'ACTIVE',
                isDeleted: false 
              },
              include: {
                _count: {
                  select: { products: true }
                }
              }
            }
          }
        }
      },
      orderBy: [
        { displayOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all categories for admin with advanced filtering
router.get('/admin/all', authenticateAdmin, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('status').optional().isIn(['ACTIVE', 'INACTIVE']),
  query('parentId').optional().isInt(),
  query('sort').optional().isIn(['newest', 'oldest', 'name_asc', 'name_desc', 'order_asc', 'order_desc']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const { search, status, parentId, sort } = req.query;

    let where = { isDeleted: false };
    let orderBy = { createdAt: 'desc' };

    // Status filter
    if (status) {
      where.status = status;
    }

    // Parent filter
    if (parentId !== undefined) {
      where.parentId = parentId === 'null' ? null : parseInt(parentId);
    }

    // Search functionality
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { seoTitle: { contains: search } },
        { metaKeywords: { contains: search } }
      ];
    }

    // Sorting
    switch (sort) {
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'name_asc':
        orderBy = { name: 'asc' };
        break;
      case 'name_desc':
        orderBy = { name: 'desc' };
        break;
      case 'order_asc':
        orderBy = { displayOrder: 'asc' };
        break;
      case 'order_desc':
        orderBy = { displayOrder: 'desc' };
        break;
    }

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        include: {
          _count: {
            select: { 
              products: true,
              children: true 
            }
          },
          parent: true,
          children: {
            where: { isDeleted: false },
            select: { id: true, name: true, status: true }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.category.count({ where })
    ]);

    res.json({
      categories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get admin categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single category with full details
router.get('/:id', async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    
    const category = await prisma.category.findFirst({
      where: { 
        id: categoryId,
        isDeleted: false 
      },
      include: {
        parent: true,
        children: {
          where: { 
            status: 'ACTIVE',
            isDeleted: false 
          },
          include: {
            _count: {
              select: { products: true }
            }
          }
        },
        _count: {
          select: { products: true }
        },
        products: {
          where: { 
            status: 'ACTIVE',
            isDeleted: false 
          },
          take: 12,
          include: { category: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Parse product images
    const categoryWithParsedProducts = {
      ...category,
      products: category.products.map(product => ({
        ...product,
        images: JSON.parse(product.images || '[]'),
        tags: JSON.parse(product.tags || '[]'),
      }))
    };

    res.json(categoryWithParsedProducts);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create category (admin only)
router.post('/', authenticateAdmin, [
  body('name').trim().isLength({ min: 1, max: 255 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('image').optional().isURL(),
  body('parentId').optional().isInt({ min: 1 }),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE']),
  body('displayOrder').optional().isInt({ min: 0 }),
  body('seoTitle').optional().trim().isLength({ max: 255 }),
  body('seoDescription').optional().trim().isLength({ max: 500 }),
  body('metaKeywords').optional().trim().isLength({ max: 255 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name, description, image, parentId, status, displayOrder,
      seoTitle, seoDescription, metaKeywords
    } = req.body;

    // Generate slug
    let slug = generateSlug(name);
    
    // Check for duplicate slug
    const existingSlug = await prisma.category.findFirst({
      where: { 
        slug,
        isDeleted: false 
      }
    });
    
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    // Check for duplicate name
    const existingName = await prisma.category.findFirst({
      where: { 
        name,
        isDeleted: false 
      }
    });
    
    if (existingName) {
      return res.status(400).json({ message: 'Category name already exists' });
    }

    // Validate parent category exists and prevent circular reference
    if (parentId) {
      const parentCategory = await prisma.category.findFirst({
        where: { 
          id: parentId,
          isDeleted: false 
        }
      });
      
      if (!parentCategory) {
        return res.status(400).json({ message: 'Parent category not found' });
      }

      // Check for circular reference (prevent category being its own parent/grandparent)
      let currentParent = parentCategory;
      while (currentParent && currentParent.parentId) {
        if (currentParent.parentId === parentId) {
          return res.status(400).json({ message: 'Circular reference detected' });
        }
        currentParent = await prisma.category.findUnique({
          where: { id: currentParent.parentId }
        });
      }
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        image,
        parentId,
        status: status || 'ACTIVE',
        displayOrder: displayOrder || 0,
        seoTitle,
        seoDescription,
        metaKeywords,
      },
      include: {
        parent: true,
        _count: {
          select: { products: true }
        }
      }
    });

    // Log audit
    await logAudit(req.admin.id, 'CREATE', 'Category', category.id, null, category, req);

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update category (admin only)
router.put('/:id', authenticateAdmin, [
  body('name').optional().trim().isLength({ min: 1, max: 255 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('image').optional().isURL(),
  body('parentId').optional().isInt({ min: 1 }),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE']),
  body('displayOrder').optional().isInt({ min: 0 }),
  body('seoTitle').optional().trim().isLength({ max: 255 }),
  body('seoDescription').optional().trim().isLength({ max: 500 }),
  body('metaKeywords').optional().trim().isLength({ max: 255 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const categoryId = parseInt(req.params.id);
    const updateData = req.body;

    // Get existing category
    const existingCategory = await prisma.category.findFirst({
      where: { 
        id: categoryId,
        isDeleted: false 
      }
    });

    if (!existingCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Handle slug update
    if (updateData.name && updateData.name !== existingCategory.name) {
      let newSlug = generateSlug(updateData.name);
      
      const existingSlug = await prisma.category.findFirst({
        where: { 
          slug: newSlug,
          id: { not: categoryId },
          isDeleted: false
        }
      });
      
      if (existingSlug) {
        newSlug = `${newSlug}-${Date.now()}`;
      }
      
      updateData.slug = newSlug;

      // Check for duplicate name
      const existingName = await prisma.category.findFirst({
        where: { 
          name: updateData.name,
          id: { not: categoryId },
          isDeleted: false
        }
      });
      
      if (existingName) {
        return res.status(400).json({ message: 'Category name already exists' });
      }
    }

    // Validate parent category and prevent circular reference
    if (updateData.parentId !== undefined) {
      if (updateData.parentId === categoryId) {
        return res.status(400).json({ message: 'Category cannot be its own parent' });
      }

      if (updateData.parentId) {
        const parentCategory = await prisma.category.findFirst({
          where: { 
            id: updateData.parentId,
            isDeleted: false 
          }
        });
        
        if (!parentCategory) {
          return res.status(400).json({ message: 'Parent category not found' });
        }

        // Check if the new parent is a descendant of this category
        const descendants = await getDescendants(categoryId);
        if (descendants.includes(updateData.parentId)) {
          return res.status(400).json({ message: 'Cannot set descendant as parent (circular reference)' });
        }
      }
    }

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: updateData,
      include: {
        parent: true,
        _count: {
          select: { products: true }
        }
      }
    });

    // Log audit
    await logAudit(req.admin.id, 'UPDATE', 'Category', categoryId, existingCategory, category, req);

    res.json({
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to get all descendants of a category
async function getDescendants(categoryId) {
  const descendants = [];
  
  const children = await prisma.category.findMany({
    where: { 
      parentId: categoryId,
      isDeleted: false 
    },
    select: { id: true }
  });

  for (const child of children) {
    descendants.push(child.id);
    const childDescendants = await getDescendants(child.id);
    descendants.push(...childDescendants);
  }

  return descendants;
}

// Soft delete category (admin only)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);

    const existingCategory = await prisma.category.findFirst({
      where: { 
        id: categoryId,
        isDeleted: false 
      },
      include: {
        _count: {
          select: { 
            products: true,
            children: true 
          }
        }
      }
    });

    if (!existingCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category has products
    if (existingCategory._count.products > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category with ${existingCategory._count.products} products. Please reassign or delete products first.` 
      });
    }

    // Check if category has subcategories
    if (existingCategory._count.children > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category with ${existingCategory._count.children} subcategories. Please reassign or delete subcategories first.` 
      });
    }

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status: 'INACTIVE'
      }
    });

    // Log audit
    await logAudit(req.admin.id, 'DELETE', 'Category', categoryId, existingCategory, category, req);

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk update category status (admin only)
router.post('/bulk/update-status', authenticateAdmin, [
  body('categoryIds').isArray({ min: 1 }),
  body('status').isIn(['ACTIVE', 'INACTIVE']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { categoryIds, status } = req.body;

    const categories = await prisma.category.updateMany({
      where: {
        id: { in: categoryIds.map(id => parseInt(id)) },
        isDeleted: false
      },
      data: { status }
    });

    // Log audit for each category
    for (const categoryId of categoryIds) {
      await logAudit(req.admin.id, 'BULK_UPDATE_STATUS', 'Category', parseInt(categoryId), null, { status }, req);
    }

    res.json({
      message: `${categories.count} categories updated successfully`,
      updatedCount: categories.count
    });
  } catch (error) {
    console.error('Bulk update status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reorder categories (admin only)
router.post('/reorder', authenticateAdmin, [
  body('categories').isArray({ min: 1 }),
  body('categories.*.id').isInt({ min: 1 }),
  body('categories.*.displayOrder').isInt({ min: 0 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { categories } = req.body;

    // Update display order for each category
    const updatePromises = categories.map(cat => 
      prisma.category.update({
        where: { 
          id: cat.id,
          isDeleted: false 
        },
        data: { displayOrder: cat.displayOrder }
      })
    );

    await Promise.all(updatePromises);

    // Log audit
    await logAudit(req.admin.id, 'REORDER', 'Category', null, null, { categories }, req);

    res.json({ message: 'Categories reordered successfully' });
  } catch (error) {
    console.error('Reorder categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get category analytics (admin only)
router.get('/admin/analytics', authenticateAdmin, async (req, res) => {
  try {
    const [
      totalCategories,
      activeCategories,
      inactiveCategories,
      rootCategories,
      categoriesWithProducts,
      categoriesWithoutProducts,
      topCategories
    ] = await Promise.all([
      prisma.category.count({ where: { isDeleted: false } }),
      prisma.category.count({ where: { status: 'ACTIVE', isDeleted: false } }),
      prisma.category.count({ where: { status: 'INACTIVE', isDeleted: false } }),
      prisma.category.count({ where: { parentId: null, isDeleted: false } }),
      prisma.category.count({ 
        where: { 
          products: { some: {} },
          isDeleted: false 
        } 
      }),
      prisma.category.count({ 
        where: { 
          products: { none: {} },
          isDeleted: false 
        } 
      }),
      prisma.category.findMany({
        where: { isDeleted: false },
        include: {
          _count: {
            select: { products: true }
          }
        },
        orderBy: {
          products: {
            _count: 'desc'
          }
        },
        take: 10
      })
    ]);

    res.json({
      stats: {
        totalCategories,
        activeCategories,
        inactiveCategories,
        rootCategories,
        categoriesWithProducts,
        categoriesWithoutProducts,
      },
      topCategories
    });
  } catch (error) {
    console.error('Get category analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
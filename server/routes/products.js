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

// Helper function to calculate stock status
const getStockStatus = (stock, status, lowStockAlert = 5) => {
  if (status === 'INACTIVE') return 'INACTIVE';
  if (stock <= 0) return 'OUT_OF_STOCK';
  if (stock <= lowStockAlert) return 'LOW_STOCK';
  return 'ACTIVE';
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
        productId: entity === 'Product' ? entityId : null,
      }
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
};

// Helper function to log inventory changes
const logInventory = async (productId, type, quantity, reason, adminId) => {
  try {
    await prisma.inventoryLog.create({
      data: {
        productId,
        type,
        quantity,
        reason,
        adminId,
      }
    });
  } catch (error) {
    console.error('Inventory log error:', error);
  }
};

// Get all products (public)
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('category').optional().isString(),
  query('search').optional().isString(),
  query('sort').optional().isIn(['newest', 'oldest', 'price_asc', 'price_desc', 'featured', 'popular']),
  query('featured').optional().isBoolean(),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('inStock').optional().isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const { category, search, sort, featured, minPrice, maxPrice, inStock } = req.query;

    let where = { 
      status: 'ACTIVE',
      isDeleted: false 
    };
    let orderBy = { createdAt: 'desc' };

    // Filter by category
    if (category) {
      where.category = { slug: category };
    }

    // Filter featured products
    if (featured === 'true') {
      where.featured = true;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Stock filter
    if (inStock === 'true') {
      where.stock = { gt: 0 };
    }

    // Search functionality
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { shortDescription: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } },
        { brand: { contains: search } },
        { sku: { contains: search } }
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
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'featured':
        orderBy = [{ featured: 'desc' }, { createdAt: 'desc' }];
        break;
      case 'popular':
        orderBy = [{ salesCount: 'desc' }, { viewCount: 'desc' }];
        break;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { 
          category: true,
          variants: {
            where: { status: 'ACTIVE' }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ]);

    // Parse JSON fields and add computed fields
    const productsWithParsedData = products.map(product => ({
      ...product,
      images: JSON.parse(product.images || '[]'),
      tags: JSON.parse(product.tags || '[]'),
      dimensions: product.dimensions ? JSON.parse(product.dimensions) : null,
      stockStatus: getStockStatus(product.stock, product.status, product.lowStockAlert),
      hasDiscount: product.discountPrice && product.discountPrice < product.price,
      discountPercentage: product.discountPrice && product.discountPrice < product.price 
        ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
        : 0,
      finalPrice: product.discountPrice && product.discountPrice < product.price 
        ? product.discountPrice 
        : product.price,
    }));

    res.json({
      products: productsWithParsedData,
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
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all products for admin with advanced filtering
router.get('/admin/all', authenticateAdmin, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('status').optional().isIn(['DRAFT', 'ACTIVE', 'INACTIVE']),
  query('category').optional().isString(),
  query('featured').optional().isBoolean(),
  query('lowStock').optional().isBoolean(),
  query('sort').optional().isIn(['newest', 'oldest', 'name_asc', 'name_desc', 'price_asc', 'price_desc', 'stock_asc', 'stock_desc']),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('minStock').optional().isInt({ min: 0 }),
  query('maxStock').optional().isInt({ min: 0 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { search, status, category, featured, lowStock, sort, minPrice, maxPrice, minStock, maxStock } = req.query;

    let where = { isDeleted: false };
    let orderBy = { createdAt: 'desc' };

    // Status filter
    if (status) {
      where.status = status;
    }

    // Category filter
    if (category) {
      where.categoryId = parseInt(category);
    }

    // Featured filter
    if (featured !== undefined) {
      where.featured = featured === 'true';
    }

    // Low stock filter
    if (lowStock === 'true') {
      where.stock = { lte: prisma.raw('low_stock_alert') };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Stock range filter
    if (minStock || maxStock) {
      where.stock = { ...where.stock };
      if (minStock) where.stock.gte = parseInt(minStock);
      if (maxStock) where.stock.lte = parseInt(maxStock);
    }

    // Search functionality
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { shortDescription: { contains: search } },
        { description: { contains: search } },
        { sku: { contains: search } },
        { brand: { contains: search } },
        { tags: { contains: search } }
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
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'stock_asc':
        orderBy = { stock: 'asc' };
        break;
      case 'stock_desc':
        orderBy = { stock: 'desc' };
        break;
    }

    const [products, total, lowStockCount, outOfStockCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          variants: true,
          _count: {
            select: { variants: true }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.product.count({ where }),
      prisma.product.count({
        where: {
          isDeleted: false,
          stock: { lte: 5 },
          status: 'ACTIVE'
        }
      }),
      prisma.product.count({
        where: {
          isDeleted: false,
          stock: 0,
          status: 'ACTIVE'
        }
      })
    ]);

    // Parse JSON fields and add computed fields
    const productsWithParsedData = products.map(product => ({
      ...product,
      images: JSON.parse(product.images || '[]'),
      tags: JSON.parse(product.tags || '[]'),
      dimensions: product.dimensions ? JSON.parse(product.dimensions) : null,
      stockStatus: getStockStatus(product.stock, product.status, product.lowStockAlert),
      hasDiscount: product.discountPrice && product.discountPrice < product.price,
      discountPercentage: product.discountPrice && product.discountPrice < product.price 
        ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
        : 0,
      finalPrice: product.discountPrice && product.discountPrice < product.price 
        ? product.discountPrice 
        : product.price,
      variantCount: product._count.variants,
    }));

    res.json({
      products: productsWithParsedData,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      stats: {
        lowStockCount,
        outOfStockCount,
        totalProducts: total
      }
    });
  } catch (error) {
    console.error('Get admin products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single product by ID or slug
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const isNumeric = /^\d+$/.test(identifier);
    
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          isNumeric ? { id: parseInt(identifier) } : { slug: identifier }
        ],
        status: 'ACTIVE',
        isDeleted: false
      },
      include: {
        category: true,
        variants: {
          where: { status: 'ACTIVE' }
        },
        relatedProducts: {
          include: {
            relatedProduct: {
              include: { category: true }
            }
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Increment view count
    await prisma.product.update({
      where: { id: product.id },
      data: { viewCount: { increment: 1 } }
    });

    // Parse JSON fields
    const productWithParsedData = {
      ...product,
      images: JSON.parse(product.images || '[]'),
      tags: JSON.parse(product.tags || '[]'),
      dimensions: product.dimensions ? JSON.parse(product.dimensions) : null,
      stockStatus: getStockStatus(product.stock, product.status, product.lowStockAlert),
      hasDiscount: product.discountPrice && product.discountPrice < product.price,
      discountPercentage: product.discountPrice && product.discountPrice < product.price 
        ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
        : 0,
      finalPrice: product.discountPrice && product.discountPrice < product.price 
        ? product.discountPrice 
        : product.price,
      relatedProducts: product.relatedProducts.map(rel => ({
        ...rel.relatedProduct,
        images: JSON.parse(rel.relatedProduct.images || '[]'),
        tags: JSON.parse(rel.relatedProduct.tags || '[]'),
        relationType: rel.relationType
      }))
    };

    res.json(productWithParsedData);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create product (admin only)
router.post('/', authenticateAdmin, [
  body('name').trim().isLength({ min: 1, max: 255 }),
  body('shortDescription').trim().isLength({ min: 1, max: 500 }),
  body('description').trim().isLength({ min: 1 }),
  body('price').isFloat({ min: 0 }),
  body('discountPrice').optional().isFloat({ min: 0 }),
  body('discountStart').optional().isISO8601(),
  body('discountEnd').optional().isISO8601(),
  body('stock').isInt({ min: 0 }),
  body('lowStockAlert').optional().isInt({ min: 0 }),
  body('sku').optional().trim().isLength({ max: 100 }),
  body('barcode').optional().trim().isLength({ max: 100 }),
  body('brand').optional().trim().isLength({ max: 100 }),
  body('weight').optional().isFloat({ min: 0 }),
  body('dimensions').optional().isObject(),
  body('categoryId').isInt({ min: 1 }),
  body('tags').optional().isArray(),
  body('status').optional().isIn(['DRAFT', 'ACTIVE', 'INACTIVE']),
  body('featured').optional().isBoolean(),
  body('mainImage').optional().isURL(),
  body('images').optional().isArray(),
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
      name, shortDescription, description, price, discountPrice, discountStart, discountEnd,
      stock, lowStockAlert, sku, barcode, brand, weight, dimensions, categoryId, tags,
      status, featured, mainImage, images, seoTitle, seoDescription, metaKeywords
    } = req.body;

    // Generate slug
    let slug = generateSlug(name);
    
    // Check for duplicate slug
    const existingSlug = await prisma.product.findUnique({
      where: { slug }
    });
    
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    // Check for duplicate SKU
    if (sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku }
      });
      
      if (existingSku) {
        return res.status(400).json({ message: 'SKU already exists' });
      }
    }

    // Validate discount
    if (discountPrice && discountPrice >= price) {
      return res.status(400).json({ message: 'Discount price must be less than regular price' });
    }

    // Validate category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });
    
    if (!category) {
      return res.status(400).json({ message: 'Category not found' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        shortDescription,
        description,
        price,
        discountPrice,
        discountStart: discountStart ? new Date(discountStart) : null,
        discountEnd: discountEnd ? new Date(discountEnd) : null,
        stock,
        lowStockAlert: lowStockAlert || 5,
        sku,
        barcode,
        brand,
        weight,
        dimensions: dimensions ? JSON.stringify(dimensions) : null,
        categoryId,
        tags: JSON.stringify(tags || []),
        status: status || 'DRAFT',
        featured: featured || false,
        mainImage,
        images: JSON.stringify(images || []),
        seoTitle,
        seoDescription,
        metaKeywords,
      },
      include: { category: true }
    });

    // Log audit
    await logAudit(req.admin.id, 'CREATE', 'Product', product.id, null, product, req);

    // Log inventory
    if (stock > 0) {
      await logInventory(product.id, 'PURCHASE', stock, 'Initial stock', req.admin.id);
    }

    res.status(201).json({
      message: 'Product created successfully',
      product: {
        ...product,
        images: JSON.parse(product.images || '[]'),
        tags: JSON.parse(product.tags || '[]'),
        dimensions: product.dimensions ? JSON.parse(product.dimensions) : null,
      }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product (admin only)
router.put('/:id', authenticateAdmin, [
  body('name').optional().trim().isLength({ min: 1, max: 255 }),
  body('shortDescription').optional().trim().isLength({ min: 1, max: 500 }),
  body('description').optional().trim().isLength({ min: 1 }),
  body('price').optional().isFloat({ min: 0 }),
  body('discountPrice').optional().isFloat({ min: 0 }),
  body('discountStart').optional().isISO8601(),
  body('discountEnd').optional().isISO8601(),
  body('stock').optional().isInt({ min: 0 }),
  body('lowStockAlert').optional().isInt({ min: 0 }),
  body('sku').optional().trim().isLength({ max: 100 }),
  body('barcode').optional().trim().isLength({ max: 100 }),
  body('brand').optional().trim().isLength({ max: 100 }),
  body('weight').optional().isFloat({ min: 0 }),
  body('dimensions').optional().isObject(),
  body('categoryId').optional().isInt({ min: 1 }),
  body('tags').optional().isArray(),
  body('status').optional().isIn(['DRAFT', 'ACTIVE', 'INACTIVE']),
  body('featured').optional().isBoolean(),
  body('mainImage').optional().isURL(),
  body('images').optional().isArray(),
  body('seoTitle').optional().trim().isLength({ max: 255 }),
  body('seoDescription').optional().trim().isLength({ max: 500 }),
  body('metaKeywords').optional().trim().isLength({ max: 255 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const productId = parseInt(req.params.id);
    const updateData = req.body;

    // Get existing product
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId, isDeleted: false }
    });

    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Handle slug update
    if (updateData.name && updateData.name !== existingProduct.name) {
      let newSlug = generateSlug(updateData.name);
      
      const existingSlug = await prisma.product.findFirst({
        where: { 
          slug: newSlug,
          id: { not: productId }
        }
      });
      
      if (existingSlug) {
        newSlug = `${newSlug}-${Date.now()}`;
      }
      
      updateData.slug = newSlug;
    }

    // Check for duplicate SKU
    if (updateData.sku && updateData.sku !== existingProduct.sku) {
      const existingSku = await prisma.product.findFirst({
        where: { 
          sku: updateData.sku,
          id: { not: productId }
        }
      });
      
      if (existingSku) {
        return res.status(400).json({ message: 'SKU already exists' });
      }
    }

    // Validate discount
    const newPrice = updateData.price || existingProduct.price;
    if (updateData.discountPrice && updateData.discountPrice >= newPrice) {
      return res.status(400).json({ message: 'Discount price must be less than regular price' });
    }

    // Validate category exists
    if (updateData.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: updateData.categoryId }
      });
      
      if (!category) {
        return res.status(400).json({ message: 'Category not found' });
      }
    }

    // Handle stock changes
    const oldStock = existingProduct.stock;
    const newStock = updateData.stock;
    
    if (newStock !== undefined && newStock !== oldStock) {
      const stockDiff = newStock - oldStock;
      const inventoryType = stockDiff > 0 ? 'ADJUSTMENT' : 'ADJUSTMENT';
      await logInventory(productId, inventoryType, stockDiff, 'Stock adjustment', req.admin.id);
    }

    // Prepare update data
    const finalUpdateData = {
      ...updateData,
      tags: updateData.tags ? JSON.stringify(updateData.tags) : undefined,
      images: updateData.images ? JSON.stringify(updateData.images) : undefined,
      dimensions: updateData.dimensions ? JSON.stringify(updateData.dimensions) : undefined,
      discountStart: updateData.discountStart ? new Date(updateData.discountStart) : undefined,
      discountEnd: updateData.discountEnd ? new Date(updateData.discountEnd) : undefined,
    };

    const product = await prisma.product.update({
      where: { id: productId },
      data: finalUpdateData,
      include: { category: true }
    });

    // Log audit
    await logAudit(req.admin.id, 'UPDATE', 'Product', productId, existingProduct, product, req);

    res.json({
      message: 'Product updated successfully',
      product: {
        ...product,
        images: JSON.parse(product.images || '[]'),
        tags: JSON.parse(product.tags || '[]'),
        dimensions: product.dimensions ? JSON.parse(product.dimensions) : null,
      }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Soft delete product (admin only)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId, isDeleted: false }
    });

    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status: 'INACTIVE'
      }
    });

    // Log audit
    await logAudit(req.admin.id, 'DELETE', 'Product', productId, existingProduct, product, req);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk operations (admin only)
router.post('/bulk/update-status', authenticateAdmin, [
  body('productIds').isArray({ min: 1 }),
  body('status').isIn(['DRAFT', 'ACTIVE', 'INACTIVE']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productIds, status } = req.body;

    const products = await prisma.product.updateMany({
      where: {
        id: { in: productIds.map(id => parseInt(id)) },
        isDeleted: false
      },
      data: { status }
    });

    // Log audit for each product
    for (const productId of productIds) {
      await logAudit(req.admin.id, 'BULK_UPDATE_STATUS', 'Product', parseInt(productId), null, { status }, req);
    }

    res.json({
      message: `${products.count} products updated successfully`,
      updatedCount: products.count
    });
  } catch (error) {
    console.error('Bulk update status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk delete products (admin only)
router.post('/bulk/delete', authenticateAdmin, [
  body('productIds').isArray({ min: 1 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productIds } = req.body;

    const products = await prisma.product.updateMany({
      where: {
        id: { in: productIds.map(id => parseInt(id)) },
        isDeleted: false
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status: 'INACTIVE'
      }
    });

    // Log audit for each product
    for (const productId of productIds) {
      await logAudit(req.admin.id, 'BULK_DELETE', 'Product', parseInt(productId), null, { isDeleted: true }, req);
    }

    res.json({
      message: `${products.count} products deleted successfully`,
      deletedCount: products.count
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get product analytics (admin only)
router.get('/admin/analytics', authenticateAdmin, async (req, res) => {
  try {
    const [
      totalProducts,
      activeProducts,
      draftProducts,
      lowStockProducts,
      outOfStockProducts,
      featuredProducts,
      topViewedProducts,
      topSellingProducts,
      recentProducts
    ] = await Promise.all([
      prisma.product.count({ where: { isDeleted: false } }),
      prisma.product.count({ where: { status: 'ACTIVE', isDeleted: false } }),
      prisma.product.count({ where: { status: 'DRAFT', isDeleted: false } }),
      prisma.product.count({ 
        where: { 
          stock: { lte: 5 }, 
          status: 'ACTIVE', 
          isDeleted: false 
        } 
      }),
      prisma.product.count({ 
        where: { 
          stock: 0, 
          status: 'ACTIVE', 
          isDeleted: false 
        } 
      }),
      prisma.product.count({ where: { featured: true, isDeleted: false } }),
      prisma.product.findMany({
        where: { isDeleted: false },
        orderBy: { viewCount: 'desc' },
        take: 10,
        include: { category: true }
      }),
      prisma.product.findMany({
        where: { isDeleted: false },
        orderBy: { salesCount: 'desc' },
        take: 10,
        include: { category: true }
      }),
      prisma.product.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { category: true }
      })
    ]);

    res.json({
      stats: {
        totalProducts,
        activeProducts,
        draftProducts,
        lowStockProducts,
        outOfStockProducts,
        featuredProducts,
      },
      topViewedProducts: topViewedProducts.map(product => ({
        ...product,
        images: JSON.parse(product.images || '[]'),
        tags: JSON.parse(product.tags || '[]'),
      })),
      topSellingProducts: topSellingProducts.map(product => ({
        ...product,
        images: JSON.parse(product.images || '[]'),
        tags: JSON.parse(product.tags || '[]'),
      })),
      recentProducts: recentProducts.map(product => ({
        ...product,
        images: JSON.parse(product.images || '[]'),
        tags: JSON.parse(product.tags || '[]'),
      }))
    });
  } catch (error) {
    console.error('Get product analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
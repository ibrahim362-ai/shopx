const express = require('express');
const { query, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get dashboard overview analytics
router.get('/dashboard', authenticateAdmin, async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    const [
      // Product stats
      totalProducts,
      activeProducts,
      draftProducts,
      lowStockProducts,
      outOfStockProducts,
      featuredProducts,
      
      // Category stats
      totalCategories,
      activeCategories,
      
      // Message stats
      totalMessages,
      unreadMessages,
      todayMessages,
      
      // Recent activity
      recentProducts,
      recentMessages,
      
      // Top performing
      topViewedProducts,
      topSellingProducts,
      topCategories,
      
      // Inventory alerts
      inventoryAlerts,
      
      // Analytics data for charts
      weeklyAnalytics,
      monthlyAnalytics
    ] = await Promise.all([
      // Product stats
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
      
      // Category stats
      prisma.category.count({ where: { isDeleted: false } }),
      prisma.category.count({ where: { status: 'ACTIVE', isDeleted: false } }),
      
      // Message stats
      prisma.message.count(),
      prisma.message.count({ where: { isRead: false } }),
      prisma.message.count({ 
        where: { 
          createdAt: { gte: startOfToday } 
        } 
      }),
      
      // Recent activity
      prisma.product.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { category: true }
      }),
      prisma.message.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      
      // Top performing
      prisma.product.findMany({
        where: { isDeleted: false },
        orderBy: { viewCount: 'desc' },
        take: 5,
        include: { category: true }
      }),
      prisma.product.findMany({
        where: { isDeleted: false },
        orderBy: { salesCount: 'desc' },
        take: 5,
        include: { category: true }
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
        take: 5
      }),
      
      // Inventory alerts
      prisma.product.findMany({
        where: {
          OR: [
            { stock: 0 },
            { stock: { lte: 5 } }
          ],
          status: 'ACTIVE',
          isDeleted: false
        },
        include: { category: true },
        orderBy: { stock: 'asc' },
        take: 10
      }),
      
      // Analytics data
      prisma.analytics.findMany({
        where: {
          date: { gte: startOfWeek }
        },
        orderBy: { date: 'asc' }
      }),
      prisma.analytics.findMany({
        where: {
          date: { gte: startOfMonth }
        },
        orderBy: { date: 'asc' }
      })
    ]);

    // Parse product images for display
    const parseProductImages = (products) => products.map(product => ({
      ...product,
      images: JSON.parse(product.images || '[]'),
      tags: JSON.parse(product.tags || '[]'),
    }));

    res.json({
      stats: {
        products: {
          total: totalProducts,
          active: activeProducts,
          draft: draftProducts,
          lowStock: lowStockProducts,
          outOfStock: outOfStockProducts,
          featured: featuredProducts,
        },
        categories: {
          total: totalCategories,
          active: activeCategories,
        },
        messages: {
          total: totalMessages,
          unread: unreadMessages,
          today: todayMessages,
        }
      },
      recentActivity: {
        products: parseProductImages(recentProducts),
        messages: recentMessages,
      },
      topPerforming: {
        viewedProducts: parseProductImages(topViewedProducts),
        sellingProducts: parseProductImages(topSellingProducts),
        categories: topCategories,
      },
      inventoryAlerts: parseProductImages(inventoryAlerts),
      analytics: {
        weekly: weeklyAnalytics,
        monthly: monthlyAnalytics,
      }
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get product analytics
router.get('/products', authenticateAdmin, [
  query('period').optional().isIn(['week', 'month', 'quarter', 'year']),
  query('category').optional().isInt({ min: 1 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { period = 'month', category } = req.query;
    
    // Calculate date range
    const today = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'quarter':
        startDate = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
        break;
      case 'year':
        startDate = new Date(today.getFullYear(), 0, 1);
        break;
    }

    let productWhere = { isDeleted: false };
    if (category) {
      productWhere.categoryId = parseInt(category);
    }

    const [
      productsByStatus,
      productsByCategory,
      stockDistribution,
      priceDistribution,
      topViewedProducts,
      topSellingProducts,
      recentlyAddedProducts,
      lowStockProducts
    ] = await Promise.all([
      // Products by status
      prisma.product.groupBy({
        by: ['status'],
        where: productWhere,
        _count: { id: true }
      }),
      
      // Products by category
      prisma.product.groupBy({
        by: ['categoryId'],
        where: productWhere,
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      }),
      
      // Stock distribution
      prisma.$queryRaw`
        SELECT 
          CASE 
            WHEN stock = 0 THEN 'Out of Stock'
            WHEN stock <= 5 THEN 'Low Stock'
            WHEN stock <= 20 THEN 'Medium Stock'
            ELSE 'High Stock'
          END as stockLevel,
          COUNT(*) as count
        FROM products 
        WHERE is_deleted = false
        GROUP BY stockLevel
      `,
      
      // Price distribution
      prisma.$queryRaw`
        SELECT 
          CASE 
            WHEN price < 10 THEN 'Under $10'
            WHEN price < 50 THEN '$10 - $50'
            WHEN price < 100 THEN '$50 - $100'
            WHEN price < 500 THEN '$100 - $500'
            ELSE 'Over $500'
          END as priceRange,
          COUNT(*) as count
        FROM products 
        WHERE is_deleted = false
        GROUP BY priceRange
      `,
      
      // Top viewed products
      prisma.product.findMany({
        where: productWhere,
        orderBy: { viewCount: 'desc' },
        take: 10,
        include: { category: true }
      }),
      
      // Top selling products
      prisma.product.findMany({
        where: productWhere,
        orderBy: { salesCount: 'desc' },
        take: 10,
        include: { category: true }
      }),
      
      // Recently added products
      prisma.product.findMany({
        where: {
          ...productWhere,
          createdAt: { gte: startDate }
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { category: true }
      }),
      
      // Low stock products
      prisma.product.findMany({
        where: {
          ...productWhere,
          stock: { lte: 5 },
          status: 'ACTIVE'
        },
        orderBy: { stock: 'asc' },
        take: 10,
        include: { category: true }
      })
    ]);

    // Get category names for products by category
    const categoryIds = productsByCategory.map(item => item.categoryId);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true }
    });

    const productsByCategoryWithNames = productsByCategory.map(item => ({
      ...item,
      categoryName: categories.find(cat => cat.id === item.categoryId)?.name || 'Unknown'
    }));

    // Parse product images
    const parseProductImages = (products) => products.map(product => ({
      ...product,
      images: JSON.parse(product.images || '[]'),
      tags: JSON.parse(product.tags || '[]'),
    }));

    res.json({
      period,
      category,
      distribution: {
        byStatus: productsByStatus,
        byCategory: productsByCategoryWithNames,
        byStock: stockDistribution,
        byPrice: priceDistribution,
      },
      topProducts: {
        viewed: parseProductImages(topViewedProducts),
        selling: parseProductImages(topSellingProducts),
      },
      recentlyAdded: parseProductImages(recentlyAddedProducts),
      lowStock: parseProductImages(lowStockProducts),
    });
  } catch (error) {
    console.error('Get product analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get category analytics
router.get('/categories', authenticateAdmin, async (req, res) => {
  try {
    const [
      categoriesByStatus,
      categoriesWithProductCount,
      categoryHierarchy,
      topCategories,
      emptyCategoriesCount,
      averageProductsPerCategory
    ] = await Promise.all([
      // Categories by status
      prisma.category.groupBy({
        by: ['status'],
        where: { isDeleted: false },
        _count: { id: true }
      }),
      
      // Categories with product count
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
        }
      }),
      
      // Category hierarchy depth
      prisma.$queryRaw`
        SELECT 
          CASE 
            WHEN parent_id IS NULL THEN 'Root'
            ELSE 'Child'
          END as level,
          COUNT(*) as count
        FROM categories 
        WHERE is_deleted = false
        GROUP BY level
      `,
      
      // Top categories by product count
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
      }),
      
      // Empty categories count
      prisma.category.count({
        where: {
          isDeleted: false,
          products: { none: {} }
        }
      }),
      
      // Average products per category
      prisma.category.aggregate({
        where: { isDeleted: false },
        _avg: {
          products: {
            _count: true
          }
        }
      })
    ]);

    res.json({
      distribution: {
        byStatus: categoriesByStatus,
        byHierarchy: categoryHierarchy,
      },
      topCategories,
      stats: {
        emptyCategoriesCount,
        averageProductsPerCategory: averageProductsPerCategory._avg || 0,
        totalCategories: categoriesWithProductCount.length,
      },
      allCategories: categoriesWithProductCount,
    });
  } catch (error) {
    console.error('Get category analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get inventory analytics
router.get('/inventory', authenticateAdmin, async (req, res) => {
  try {
    const [
      stockSummary,
      lowStockProducts,
      outOfStockProducts,
      stockMovements,
      stockValueByCategory,
      inventoryTurnover
    ] = await Promise.all([
      // Stock summary
      prisma.product.aggregate({
        where: { 
          isDeleted: false,
          status: 'ACTIVE' 
        },
        _sum: { stock: true },
        _avg: { stock: true },
        _count: { id: true }
      }),
      
      // Low stock products
      prisma.product.findMany({
        where: {
          stock: { 
            gt: 0,
            lte: 5 
          },
          status: 'ACTIVE',
          isDeleted: false
        },
        include: { category: true },
        orderBy: { stock: 'asc' }
      }),
      
      // Out of stock products
      prisma.product.findMany({
        where: {
          stock: 0,
          status: 'ACTIVE',
          isDeleted: false
        },
        include: { category: true },
        orderBy: { name: 'asc' }
      }),
      
      // Recent stock movements
      prisma.inventoryLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          product: {
            select: { name: true, sku: true }
          },
          admin: {
            select: { name: true }
          }
        }
      }),
      
      // Stock value by category
      prisma.$queryRaw`
        SELECT 
          c.name as categoryName,
          SUM(p.stock * p.price) as totalValue,
          SUM(p.stock) as totalStock,
          COUNT(p.id) as productCount
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.is_deleted = false AND p.status = 'ACTIVE'
        GROUP BY c.id, c.name
        ORDER BY totalValue DESC
      `,
      
      // Inventory turnover (mock data - would need order data for real calculation)
      prisma.product.findMany({
        where: {
          isDeleted: false,
          status: 'ACTIVE',
          salesCount: { gt: 0 }
        },
        select: {
          id: true,
          name: true,
          stock: true,
          salesCount: true,
          price: true
        },
        orderBy: { salesCount: 'desc' },
        take: 10
      })
    ]);

    // Parse product images
    const parseProductImages = (products) => products.map(product => ({
      ...product,
      images: JSON.parse(product.images || '[]'),
      tags: JSON.parse(product.tags || '[]'),
    }));

    res.json({
      summary: {
        totalStock: stockSummary._sum.stock || 0,
        averageStock: Math.round(stockSummary._avg.stock || 0),
        totalProducts: stockSummary._count,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
      },
      alerts: {
        lowStock: parseProductImages(lowStockProducts),
        outOfStock: parseProductImages(outOfStockProducts),
      },
      movements: stockMovements,
      valueByCategory: stockValueByCategory,
      topTurnover: inventoryTurnover,
    });
  } catch (error) {
    console.error('Get inventory analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update daily analytics (internal use)
router.post('/update-daily', authenticateAdmin, async (req, res) => {
  try {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];

    // Get today's stats
    const [
      productViews,
      totalProducts,
      totalCategories,
      totalMessages
    ] = await Promise.all([
      prisma.product.aggregate({
        _sum: { viewCount: true }
      }),
      prisma.product.count({ where: { isDeleted: false } }),
      prisma.category.count({ where: { isDeleted: false } }),
      prisma.message.count()
    ]);

    // Upsert analytics record
    await prisma.analytics.upsert({
      where: { date: new Date(dateString) },
      update: {
        productViews: productViews._sum.viewCount || 0,
        data: JSON.stringify({
          totalProducts,
          totalCategories,
          totalMessages,
          updatedAt: new Date()
        })
      },
      create: {
        date: new Date(dateString),
        productViews: productViews._sum.viewCount || 0,
        orders: 0, // Would be updated when order system is implemented
        revenue: 0, // Would be updated when order system is implemented
        visitors: 0, // Would be updated with visitor tracking
        data: JSON.stringify({
          totalProducts,
          totalCategories,
          totalMessages,
          createdAt: new Date()
        })
      }
    });

    res.json({ message: 'Daily analytics updated successfully' });
  } catch (error) {
    console.error('Update daily analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
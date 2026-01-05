const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get page content (public)
router.get('/:page', async (req, res) => {
  try {
    const { page } = req.params;
    
    const content = await prisma.pageContent.findMany({
      where: {
        page: page.toLowerCase(),
        isActive: true
      },
      orderBy: {
        displayOrder: 'asc'
      }
    });

    res.json(content);
  } catch (error) {
    console.error('Error fetching page content:', error);
    res.status(500).json({ error: 'Failed to fetch page content' });
  }
});

// Get all page content for admin
router.get('/admin/all', authenticateAdmin, async (req, res) => {
  try {
    const content = await prisma.pageContent.findMany({
      orderBy: [
        { page: 'asc' },
        { displayOrder: 'asc' }
      ]
    });

    // Group by page
    const groupedContent = content.reduce((acc, item) => {
      if (!acc[item.page]) {
        acc[item.page] = [];
      }
      acc[item.page].push(item);
      return acc;
    }, {});

    res.json(groupedContent);
  } catch (error) {
    console.error('Error fetching all page content:', error);
    res.status(500).json({ error: 'Failed to fetch page content' });
  }
});

// Create or update page content (admin only)
router.put('/:page/:section', 
  authenticateAdmin,
  [
    body('title').optional().isLength({ max: 255 }),
    body('subtitle').optional().isLength({ max: 255 }),
    body('description').optional(),
    body('content').optional(),
    body('image').optional().isURL().withMessage('Image must be a valid URL'),
    body('images').optional().isJSON().withMessage('Images must be valid JSON'),
    body('data').optional().isJSON().withMessage('Data must be valid JSON'),
    body('displayOrder').optional().isInt({ min: 0 }),
    body('isActive').optional().isBoolean()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { page, section } = req.params;
      const {
        title,
        subtitle,
        description,
        content,
        image,
        images,
        data,
        displayOrder = 0,
        isActive = true
      } = req.body;

      const pageContent = await prisma.pageContent.upsert({
        where: {
          page_section: {
            page: page.toLowerCase(),
            section: section.toLowerCase()
          }
        },
        update: {
          title,
          subtitle,
          description,
          content,
          image,
          images,
          data,
          displayOrder,
          isActive,
          updatedAt: new Date()
        },
        create: {
          page: page.toLowerCase(),
          section: section.toLowerCase(),
          title,
          subtitle,
          description,
          content,
          image,
          images,
          data,
          displayOrder,
          isActive
        }
      });

      res.json(pageContent);
    } catch (error) {
      console.error('Error updating page content:', error);
      res.status(500).json({ error: 'Failed to update page content' });
    }
  }
);

// Delete page content section (admin only)
router.delete('/:page/:section', authenticateAdmin, async (req, res) => {
  try {
    const { page, section } = req.params;

    await prisma.pageContent.delete({
      where: {
        page_section: {
          page: page.toLowerCase(),
          section: section.toLowerCase()
        }
      }
    });

    res.json({ message: 'Page content deleted successfully' });
  } catch (error) {
    console.error('Error deleting page content:', error);
    res.status(500).json({ error: 'Failed to delete page content' });
  }
});

// Initialize default page content (admin only)
router.post('/admin/initialize', authenticateAdmin, async (req, res) => {
  try {
    const defaultContent = [
      // Home Page Content
      {
        page: 'home',
        section: 'hero',
        title: 'Discover Luxury Beauty',
        subtitle: 'Premium cosmetics & skincare',
        description: 'Indulge in the finest selection of luxury beauty products, carefully curated for the discerning connoisseur.',
        image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&h=600&fit=crop',
        displayOrder: 1
      },
      {
        page: 'home',
        section: 'features',
        title: 'Why Choose Us',
        subtitle: 'Excellence in every detail',
        data: JSON.stringify([
          {
            icon: 'Crown',
            title: 'Luxury Brands',
            description: 'Exclusive collection from world-renowned luxury brands'
          },
          {
            icon: 'Shield',
            title: 'Authenticity Guaranteed',
            description: '100% authentic products with certificates of authenticity'
          },
          {
            icon: 'Truck',
            title: 'Premium Delivery',
            description: 'White-glove delivery service with elegant packaging'
          }
        ]),
        displayOrder: 2
      },
      // About Page Content
      {
        page: 'about',
        section: 'hero',
        title: 'Our Story',
        subtitle: 'Crafting beauty experiences since 2020',
        description: 'Founded with a passion for luxury beauty, we curate the finest cosmetics and skincare products from around the world.',
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&h=600&fit=crop',
        displayOrder: 1
      },
      {
        page: 'about',
        section: 'mission',
        title: 'Our Mission',
        description: 'To make luxury beauty accessible while maintaining the highest standards of quality and authenticity.',
        displayOrder: 2
      },
      {
        page: 'about',
        section: 'team',
        title: 'Meet Our Team',
        subtitle: 'Beauty experts at your service',
        data: JSON.stringify([
          {
            name: 'Isabella Laurent',
            role: 'Founder & Beauty Director',
            image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face',
            description: 'Former Chanel beauty consultant with 15 years in luxury cosmetics'
          },
          {
            name: 'Sophia Chen',
            role: 'Head of Fragrance Curation',
            image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
            description: 'Certified perfumer and fragrance expert from Grasse, France'
          }
        ]),
        displayOrder: 3
      },
      // Contact Page Content
      {
        page: 'contact',
        section: 'hero',
        title: 'Get in Touch',
        subtitle: 'We\'re here to help',
        description: 'Have questions about our products or need beauty advice? Our expert consultants are ready to assist you.',
        displayOrder: 1
      },
      {
        page: 'contact',
        section: 'info',
        title: 'Contact Information',
        data: JSON.stringify([
          {
            icon: 'Mail',
            title: 'Email Us',
            details: 'hello@luxebeauty.com',
            description: 'Beauty consultations & product inquiries'
          },
          {
            icon: 'Phone',
            title: 'Call Us',
            details: '+1 (555) LUXE-BEAUTY',
            description: 'Mon-Fri: 9am-7pm, Sat: 10am-5pm'
          },
          {
            icon: 'MapPin',
            title: 'Visit Our Boutique',
            details: '123 Beauty Boulevard',
            description: 'Luxury District, LD 12345'
          }
        ]),
        displayOrder: 2
      }
    ];

    // Create default content if it doesn't exist
    for (const content of defaultContent) {
      await prisma.pageContent.upsert({
        where: {
          page_section: {
            page: content.page,
            section: content.section
          }
        },
        update: {},
        create: content
      });
    }

    res.json({ message: 'Default page content initialized successfully' });
  } catch (error) {
    console.error('Error initializing page content:', error);
    res.status(500).json({ error: 'Failed to initialize page content' });
  }
});

// Bulk update page content (admin only)
router.put('/admin/:page/bulk', 
  authenticateAdmin,
  [
    body('sections').isArray().withMessage('Sections must be an array'),
    body('sections.*.section').notEmpty().withMessage('Section name is required'),
    body('sections.*.title').optional().isLength({ max: 255 }),
    body('sections.*.subtitle').optional().isLength({ max: 255 }),
    body('sections.*.description').optional(),
    body('sections.*.content').optional(),
    body('sections.*.image').optional().isURL().withMessage('Image must be a valid URL'),
    body('sections.*.images').optional().isJSON().withMessage('Images must be valid JSON'),
    body('sections.*.data').optional().isJSON().withMessage('Data must be valid JSON'),
    body('sections.*.displayOrder').optional().isInt({ min: 0 }),
    body('sections.*.isActive').optional().isBoolean()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { page } = req.params;
      const { sections } = req.body;

      const results = [];

      // Use transaction for bulk operations
      await prisma.$transaction(async (tx) => {
        for (const sectionData of sections) {
          const {
            section,
            title,
            subtitle,
            description,
            content,
            image,
            images,
            data,
            displayOrder = 0,
            isActive = true
          } = sectionData;

          const pageContent = await tx.pageContent.upsert({
            where: {
              page_section: {
                page: page.toLowerCase(),
                section: section.toLowerCase()
              }
            },
            update: {
              title,
              subtitle,
              description,
              content,
              image,
              images,
              data,
              displayOrder,
              isActive,
              updatedAt: new Date()
            },
            create: {
              page: page.toLowerCase(),
              section: section.toLowerCase(),
              title,
              subtitle,
              description,
              content,
              image,
              images,
              data,
              displayOrder,
              isActive
            }
          });

          results.push(pageContent);
        }
      });

      res.json({ 
        message: 'Bulk update completed successfully',
        updated: results.length,
        sections: results
      });
    } catch (error) {
      console.error('Error bulk updating page content:', error);
      res.status(500).json({ error: 'Failed to bulk update page content' });
    }
  }
);

module.exports = router;
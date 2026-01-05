const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get settings (public)
router.get('/', async (req, res) => {
  try {
    let settings = await prisma.settings.findFirst();
    
    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.settings.create({
        data: {
          siteName: 'E-Commerce Store',
          contactInfo: JSON.stringify({
            email: 'contact@store.com',
            phone: '+1 (555) 123-4567',
            address: '123 Business St, City, State 12345'
          }),
          socialLinks: JSON.stringify({
            facebook: '',
            twitter: '',
            instagram: '',
            linkedin: ''
          })
        }
      });
    }

    // Parse JSON fields
    const parsedSettings = {
      ...settings,
      contactInfo: JSON.parse(settings.contactInfo || '{}'),
      socialLinks: JSON.parse(settings.socialLinks || '{}')
    };

    res.json(parsedSettings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update settings (admin only)
router.put('/', [
  authenticateAdmin,
  body('siteName').optional().trim().isLength({ min: 1 }),
  body('logo').optional().isURL(),
  body('favicon').optional().isURL(),
  body('contactInfo').optional().isObject(),
  body('socialLinks').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updateData = { ...req.body };

    // Stringify JSON fields
    if (updateData.contactInfo) {
      updateData.contactInfo = JSON.stringify(updateData.contactInfo);
    }
    if (updateData.socialLinks) {
      updateData.socialLinks = JSON.stringify(updateData.socialLinks);
    }

    let settings = await prisma.settings.findFirst();
    
    if (!settings) {
      settings = await prisma.settings.create({
        data: updateData
      });
    } else {
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: updateData
      });
    }

    // Parse JSON fields for response
    const parsedSettings = {
      ...settings,
      contactInfo: JSON.parse(settings.contactInfo || '{}'),
      socialLinks: JSON.parse(settings.socialLinks || '{}')
    };

    res.json(parsedSettings);
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
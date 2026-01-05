const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateAdmin } = require('../middleware/auth');
const emailService = require('../utils/emailService');

const router = express.Router();
const prisma = new PrismaClient();

// Submit contact message (public)
router.post('/', [
  body('name').trim().isLength({ min: 1 }),
  body('email').isEmail().normalizeEmail(),
  body('phone').optional().trim(),
  body('message').trim().isLength({ min: 10 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, message } = req.body;

    const newMessage = await prisma.message.create({
      data: { name, email, phone, message }
    });

    res.status(201).json({ 
      message: 'Message sent successfully!',
      id: newMessage.id 
    });
  } catch (error) {
    console.error('Submit message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all messages (admin only)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          repliedByAdmin: {
            select: { id: true, name: true, username: true }
          }
        }
      }),
      prisma.message.count()
    ]);

    res.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark message as read (admin only)
router.put('/:id/read', authenticateAdmin, async (req, res) => {
  try {
    const messageId = parseInt(req.params.id);

    const message = await prisma.message.update({
      where: { id: messageId },
      data: { isRead: true }
    });

    res.json(message);
  } catch (error) {
    console.error('Mark message read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete message (admin only)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const messageId = parseInt(req.params.id);

    await prisma.message.delete({
      where: { id: messageId }
    });

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reply to message via email (admin only)
router.post('/:id/reply', [
  authenticateAdmin,
  body('replyContent').trim().isLength({ min: 10 }).withMessage('Reply must be at least 10 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const messageId = parseInt(req.params.id);
    const { replyContent } = req.body;
    const adminId = req.admin.id;

    // Get the original message
    const originalMessage = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!originalMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Always save the reply to database first
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        hasReply: true,
        replyContent,
        repliedAt: new Date(),
        repliedBy: adminId,
        isRead: true // Mark as read when replied
      },
      include: {
        repliedByAdmin: {
          select: { id: true, name: true, username: true }
        }
      }
    });

    // Try to send email reply
    const emailResult = await emailService.sendReplyEmail(
      originalMessage.email,
      originalMessage.name,
      originalMessage.message,
      replyContent,
      req.admin.name || req.admin.username
    );

    if (!emailResult.success) {
      // Email failed but reply is saved - return success with warning
      return res.json({
        message: 'Reply saved successfully, but email could not be sent',
        warning: emailResult.error,
        data: updatedMessage,
        emailSent: false
      });
    }

    // Both database and email successful
    res.json({
      message: 'Reply sent successfully',
      data: updatedMessage,
      emailMessageId: emailResult.messageId,
      emailSent: true
    });
  } catch (error) {
    console.error('Reply to message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Test email configuration (admin only)
router.post('/test-email', authenticateAdmin, async (req, res) => {
  try {
    const testResult = await emailService.testConnection();
    
    if (testResult) {
      res.json({ 
        message: 'Email service is configured correctly',
        status: 'success' 
      });
    } else {
      res.status(500).json({ 
        message: 'Email service configuration failed',
        status: 'error' 
      });
    }
  } catch (error) {
    console.error('Email test error:', error);
    res.status(500).json({ 
      message: 'Email service test failed',
      error: error.message,
      status: 'error' 
    });
  }
});

module.exports = router;
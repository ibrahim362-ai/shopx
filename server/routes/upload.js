const express = require('express');
const path = require('path');
const { upload, getFileUrl, deleteFile } = require('../utils/imageUpload');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// Single image upload
router.post('/image', authenticateAdmin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        message: 'No image file provided' 
      });
    }

    const imageUrl = getFileUrl(req, req.file.filename, req.body.folder || 'general');

    res.json({
      message: 'Image uploaded successfully',
      url: imageUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      message: error.message || 'Image upload failed' 
    });
  }
});

// Multiple images upload
router.post('/images', authenticateAdmin, upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        message: 'No image files provided' 
      });
    }

    const uploadedImages = req.files.map(file => ({
      url: getFileUrl(req, file.filename, req.body.folder || 'general'),
      filename: file.filename,
      originalName: file.originalname,
      size: file.size
    }));

    res.json({
      message: `${uploadedImages.length} images uploaded successfully`,
      images: uploadedImages
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      message: error.message || 'Images upload failed' 
    });
  }
});

// Delete image
router.delete('/image/:filename', authenticateAdmin, (req, res) => {
  try {
    const { filename } = req.params;
    const { folder = 'general' } = req.query;
    
    const filePath = path.join(__dirname, '../uploads', folder, filename);
    const deleted = deleteFile(filePath);

    if (deleted) {
      res.json({ message: 'Image deleted successfully' });
    } else {
      res.status(404).json({ message: 'Image not found' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      message: 'Failed to delete image' 
    });
  }
});

module.exports = router;
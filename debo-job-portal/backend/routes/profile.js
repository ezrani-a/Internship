// backend/routes/profile.js
const express = require('express');
const router = express.Router();
const { 
  getProfile, 
  updateProfile, 
  uploadResume, 
  deleteResume 
} = require('../controllers/profileController');
const { authenticate } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

// All profile routes require authentication
router.use(authenticate);

router.get('/', getProfile);
router.put('/', updateProfile);
router.post('/upload-resume', upload.single('resume'), handleUploadError, uploadResume);
router.delete('/resume', deleteResume);

module.exports = router;
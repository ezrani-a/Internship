// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const { 
  getDashboardStats, 
  getAllUsers, 
  updateUserRole 
} = require('../controllers/adminController');
const { authenticate, requireRole } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireRole(['admin', 'super_admin']));

router.get('/dashboard/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);

module.exports = router;
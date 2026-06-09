const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getReports,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, authorize('admin'), getDashboardStats);
router.get('/reports', protect, authorize('admin'), getReports);

module.exports = router;

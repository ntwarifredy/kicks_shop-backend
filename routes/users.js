const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getOrders,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/orders', protect, getOrders);

module.exports = router;

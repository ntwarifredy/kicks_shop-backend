const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markNotificationRead,
  markAllRead,
  deleteNotification,
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getNotifications);
router.put('/read/all', protect, authorize('admin'), markAllRead);
router.put('/:id/read', protect, authorize('admin'), markNotificationRead);
router.delete('/:id', protect, authorize('admin'), deleteNotification);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  submitContact,
  getContactMessages,
  markMessageRead,
} = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', submitContact);
router.get('/', protect, authorize('admin'), getContactMessages);
router.put('/:id/read', protect, authorize('admin'), markMessageRead);

module.exports = router;

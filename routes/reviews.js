const express = require('express');
const router = express.Router();
const {
  getProductReviews,
  deleteReview,
  updateReviewStatus,
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.get('/product/:productId', getProductReviews);
router.delete('/:id', protect, authorize('admin'), deleteReview);
router.put('/:id/status', protect, authorize('admin'), updateReviewStatus);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  moveToCart,
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getWishlist);
router.post('/', protect, addToWishlist);
router.delete('/:productId', protect, removeFromWishlist);
router.post('/move-to-cart/:productId', protect, moveToCart);

module.exports = router;

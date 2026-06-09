const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  confirmStripePayment,
  initiateMobileMoney,
  confirmMobileMoney,
  initiatePayPal,
  confirmPayPal,
  getPaymentStatus,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/create-intent', protect, createPaymentIntent);
router.post('/confirm-stripe', protect, confirmStripePayment);
router.post('/mobile-money/initiate', protect, initiateMobileMoney);
router.post('/mobile-money/confirm', protect, confirmMobileMoney);
router.post('/paypal/initiate', protect, initiatePayPal);
router.post('/paypal/confirm', protect, confirmPayPal);
router.get('/status/:orderId', protect, getPaymentStatus);

module.exports = router;

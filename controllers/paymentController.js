const mongoose = require('mongoose');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const Stripe = require('stripe');

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
let stripe;
if (stripeSecretKey && stripeSecretKey !== 'sk_test_placeholder') {
  stripe = Stripe(stripeSecretKey);
}

const createPaymentIntent = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (order.isPaid) {
      return res.status(400).json({ success: false, message: 'Order already paid' });
    }

    if (!stripe) {
      return res.status(200).json({
        success: true,
        clientSecret: null,
        mode: 'demo',
        message: 'Stripe not configured — demo mode. Use "pay now" to mark as paid.',
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalPrice * 100),
      currency: 'usd',
      metadata: { orderId: order._id.toString() },
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      mode: 'live',
    });
  } catch (error) {
    next(error);
  }
};

const confirmStripePayment = async (req, res, next) => {
  try {
    const { paymentIntentId, orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (stripe) {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ success: false, message: 'Payment not completed' });
      }
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: paymentIntentId || 'manual_' + Date.now(),
      status: 'completed',
      update_time: new Date().toISOString(),
      email_address: req.user.email,
    };

    if (order.orderStatus === 'pending') {
      order.orderStatus = 'confirmed';
    }

    await order.save();

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

const initiateMobileMoney = async (req, res, next) => {
  try {
    const { orderId, phoneNumber, provider } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }
    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID format' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this order' });
    }
    if (order.isPaid) {
      return res.status(400).json({ success: false, message: 'Order already paid' });
    }

    const reference = 'MM-' + Date.now().toString(36).toUpperCase();
    const providerLabel = provider === 'mtn' ? 'MTN Mobile Money' : 'Airtel Money';

    order.paymentResult = {
      id: reference,
      status: 'pending',
      update_time: new Date().toISOString(),
      email_address: phoneNumber,
    };
    await order.save();

    res.status(200).json({
      success: true,
      reference,
      message: `${providerLabel} payment initiated. Check your phone to complete payment using reference: ${reference}`,
    });
  } catch (error) {
    next(error);
  }
};

const confirmMobileMoney = async (req, res, next) => {
  try {
    const { orderId, reference } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.paymentResult?.id !== reference) {
      return res.status(400).json({ success: false, message: 'Invalid reference' });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult.status = 'completed';
    order.paymentResult.update_time = new Date().toISOString();

    if (order.orderStatus === 'pending') {
      order.orderStatus = 'confirmed';
    }
    await order.save();

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

const initiatePayPal = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (order.isPaid) {
      return res.status(400).json({ success: false, message: 'Order already paid' });
    }

    const paypalOrderId = 'PP-' + Date.now().toString(36).toUpperCase();

    order.paymentResult = {
      id: paypalOrderId,
      status: 'pending',
      update_time: new Date().toISOString(),
      email_address: req.user.email,
    };
    await order.save();

    res.status(200).json({
      success: true,
      paypalOrderId,
      message: 'PayPal order created. Complete payment via PayPal.',
    });
  } catch (error) {
    next(error);
  }
};

const confirmPayPal = async (req, res, next) => {
  try {
    const { orderId, paypalOrderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.paymentResult?.id !== paypalOrderId) {
      return res.status(400).json({ success: false, message: 'Invalid PayPal order ID' });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult.status = 'completed';
    order.paymentResult.update_time = new Date().toISOString();

    if (order.orderStatus === 'pending') {
      order.orderStatus = 'confirmed';
    }
    await order.save();

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

const getPaymentStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId).select(
      'isPaid paidAt paymentMethod paymentResult orderStatus'
    );
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    if (endpointSecret && stripe) {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } else {
      event = req.body;
    }
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata?.orderId;

    if (orderId) {
      const order = await Order.findById(orderId);
      if (order && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
          id: paymentIntent.id,
          status: 'completed',
          update_time: new Date().toISOString(),
          email_address: paymentIntent.receipt_email,
        };
        if (order.orderStatus === 'pending') {
          order.orderStatus = 'confirmed';
        }
        await order.save();
      }
    }
  }

  res.json({ received: true });
};

module.exports = {
  createPaymentIntent,
  confirmStripePayment,
  initiateMobileMoney,
  confirmMobileMoney,
  initiatePayPal,
  confirmPayPal,
  getPaymentStatus,
  handleStripeWebhook,
};

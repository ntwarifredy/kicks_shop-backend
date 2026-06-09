const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/errorHandler');
const connectDB = require('./config/db');

require('dotenv').config({ path: path.join(__dirname, '.env') });

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/users', require('./routes/users'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/admin/notifications', require('./routes/notifications'));
app.use('/api/admin', require('./routes/admin'));

app.post('/api/payments/webhook/stripe', express.raw({ type: 'application/json' }), (req, res, next) => {
  req.rawBody = req.body;
  req.body = JSON.parse(req.body.toString());
  next();
}, require('./controllers/paymentController').handleStripeWebhook);

app.use('/api/payments', require('./routes/payment'));

app.get('/api/placeholder', (req, res) => {
  const text = req.query.text || 'No Image';
  const w = parseInt(req.query.w) || 300;
  const h = parseInt(req.query.h) || 300;
  const fontSize = Math.min(w, h) / 12;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect fill="#1f2937" width="${w}" height="${h}"/><text fill="#6b7280" font-family="Arial" font-size="${fontSize}" x="${w/2}" y="${h/2}" text-anchor="middle" dominant-baseline="middle">${text}</text></svg>`;
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svg);
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'KICKS_SHOP API is running' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

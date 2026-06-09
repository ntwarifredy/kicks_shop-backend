const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/kickshop',
  jwtSecret: process.env.JWT_SECRET || 'kickshop_jwt_secret_key_2024',
  jwtExpire: process.env.JWT_EXPIRE || '30d',
  jwtCookieExpire: process.env.JWT_COOKIE_EXPIRE || 30,
  smtpHost: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  smtpPort: process.env.SMTP_PORT || 2525,
  smtpEmail: process.env.SMTP_EMAIL || '',
  smtpPassword: process.env.SMTP_PASSWORD || '',
  fromEmail: process.env.FROM_EMAIL || 'noreply@kickshop.com',
  fromName: process.env.FROM_NAME || 'KicksShop',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder',
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
};

module.exports = config;

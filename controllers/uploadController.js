const { v2: cloudinary } = require('cloudinary');
const config = require('../config/config');

const cloudinaryConfigured = config.cloudinaryCloudName && config.cloudinaryApiKey && config.cloudinaryApiSecret;

const getUploadSignature = (req, res) => {
  if (!cloudinaryConfigured) {
    return res.status(400).json({ success: false, message: 'Cloudinary not configured' });
  }

  cloudinary.config({
    cloud_name: config.cloudinaryCloudName,
    api_key: config.cloudinaryApiKey,
    api_secret: config.cloudinaryApiSecret,
  });

  const timestamp = Math.round(Date.now() / 1000);
  const folder = 'kicks_shop';

  const params = { timestamp, folder };
  const signature = cloudinary.utils.api_sign_request(params, config.cloudinaryApiSecret);

  res.json({
    success: true,
    data: {
      signature,
      timestamp,
      cloudName: config.cloudinaryCloudName,
      apiKey: config.cloudinaryApiKey,
      folder,
    },
  });
};

module.exports = { getUploadSignature };

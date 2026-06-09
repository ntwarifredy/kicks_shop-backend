const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');

const useCloudinary = config.cloudinaryCloudName && config.cloudinaryApiKey && config.cloudinaryApiSecret;

let upload;

if (useCloudinary) {
  const { v2: cloudinary } = require('cloudinary');
  const { CloudinaryStorage } = require('multer-storage-cloudinary');

  cloudinary.config({
    cloud_name: config.cloudinaryCloudName,
    api_key: config.cloudinaryApiKey,
    api_secret: config.cloudinaryApiSecret,
  });

  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'kicks_shop',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
    },
  });

  upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
} else {
  const uploadDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    allowedTypes.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Only jpg, jpeg, png, and webp images are allowed'), false);
  };

  upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
}

module.exports = upload;

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const config = require('../config/config');

const useCloudinary = config.cloudinaryCloudName && config.cloudinaryApiKey && config.cloudinaryApiSecret;

let upload;

function findWritableDir() {
  const candidates = [
    path.join(fs.realpathSync(__dirname), '..', 'uploads'),
    path.resolve(process.cwd(), 'uploads'),
    path.join(os.tmpdir(), 'kicks-shop-uploads'),
  ];

  for (const dir of candidates) {
    try {
      fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
      fs.accessSync(dir, fs.constants.W_OK);
      console.log('[upload] Using directory:', dir);
      return dir;
    } catch (err) {
      console.log('[upload] Skipping', dir, '-', err.message);
    }
  }

  const fallback = candidates[candidates.length - 1];
  console.error('[upload] All directories failed, using fallback:', fallback);
  fs.mkdirSync(fallback, { recursive: true, mode: 0o755 });
  return fallback;
}

const uploadDir = findWritableDir();

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
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      try {
        fs.mkdirSync(uploadDir, { recursive: true, mode: 0o755 });
        cb(null, uploadDir);
      } catch (err) {
        console.error('[upload] destination error:', err.message);
        cb(err);
      }
    },
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
module.exports.uploadDir = uploadDir;

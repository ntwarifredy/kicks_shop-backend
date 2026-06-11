const express = require('express');
const router = express.Router();
const { getUploadSignature } = require('../controllers/uploadController');

router.get('/signature', getUploadSignature);

module.exports = router;

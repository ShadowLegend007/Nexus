const express = require('express');
const router = express.Router();
const { uploadFile } = require('../controllers/upload.controller');
const upload = require('../middleware/upload.middleware');
const { protect } = require('../middleware/auth.middleware');
const { uploadLimiter } = require('../middleware/rateLimiter');

router.post('/', protect, uploadLimiter, upload.single('file'), uploadFile);

module.exports = router;

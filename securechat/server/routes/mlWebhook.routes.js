const express = require('express');
const router = express.Router();
const { postVerdict } = require('../controllers/mlWebhook.controller');

router.post('/verdict', postVerdict);

module.exports = router;

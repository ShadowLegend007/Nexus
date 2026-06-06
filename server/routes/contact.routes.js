const express = require('express');
const router = express.Router();
const { addContact, addSelfContact, listContacts, resolveHex } = require('../controllers/contact.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/add', protect, addContact);
router.post('/add-self', protect, addSelfContact);
router.get('/', protect, listContacts);
router.get('/resolve/:hexId', protect, resolveHex);

module.exports = router;

const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const {
  createShortUrl,
  redirectUrl,
  getStats
} = require('../controllers/urlController');

router.post('/shorturls', auth, createShortUrl);
router.get('/shorturls/:shortCode', auth, getStats);
router.get('/:shortCode', redirectUrl);

module.exports = router;

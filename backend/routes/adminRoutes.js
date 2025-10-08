const express = require('express');
const { register, login, rotateAllTokens, startTransfer, confirmTransfer } = require('../controllers/adminController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
// Invalidate all tokens (memory semantics: forces logout everywhere)
router.post('/rotate', requireAuth, rotateAllTokens);
// Admin transfer flow
router.post('/transfer/start', requireAuth, startTransfer);
router.post('/transfer/confirm', confirmTransfer);

module.exports = router;



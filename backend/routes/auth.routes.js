const r = require('express').Router();
const c = require('../controllers/auth.controller');
const { protect, authorize } = require('../middleware/auth');
r.post('/login', c.login);
r.get('/me', protect, c.me);
r.post('/register', protect, authorize('admin'), c.register);
module.exports = r;

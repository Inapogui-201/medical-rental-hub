const r = require('express').Router();
const c = require('../controllers/payment.controller');
const { protect, authorize } = require('../middleware/auth');
r.use(protect);
r.get('/', authorize('admin', 'caissier'), c.list);
r.post('/', authorize('admin', 'caissier'), c.create);
r.get('/:id/receipt', authorize('admin', 'caissier'), c.receipt);
module.exports = r;

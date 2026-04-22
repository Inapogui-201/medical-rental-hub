const r = require('express').Router();
const c = require('../controllers/order.controller');
const { protect, authorize } = require('../middleware/auth');
r.use(protect);
r.get('/', c.list);
r.get('/:id', c.get);
r.post('/', authorize('admin', 'employe'), c.create);
r.patch('/:id/status', authorize('admin', 'employe', 'livreur'), c.setStatus);
module.exports = r;

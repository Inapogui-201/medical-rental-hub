const r = require('express').Router();
const c = require('../controllers/deposit.controller');
const { protect, authorize } = require('../middleware/auth');
r.use(protect);
r.get('/', authorize('admin', 'caissier', 'employe'), c.list);
r.post('/', authorize('admin', 'caissier', 'employe'), c.create);
r.patch('/:id/status', authorize('admin', 'caissier'), c.setStatus);
module.exports = r;

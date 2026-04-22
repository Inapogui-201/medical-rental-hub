const r = require('express').Router();
const c = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth');
r.use(protect, authorize('admin'));
r.get('/', c.list);
r.put('/:id', c.update);
r.delete('/:id', c.remove);
module.exports = r;

const r = require('express').Router();
const c = require('../controllers/unit.controller');
const { protect, authorize } = require('../middleware/auth');
r.use(protect);
r.get('/', c.list);
r.post('/', authorize('admin', 'employe'), c.create);
r.put('/:id', authorize('admin', 'employe'), c.update);
r.delete('/:id', authorize('admin'), c.remove);
module.exports = r;

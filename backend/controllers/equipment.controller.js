const Equipment = require('../models/Equipment');
const Unit = require('../models/Unit');

exports.list = async (_req, res) => {
  const items = await Equipment.find().sort('-createdAt');
  res.json(items);
};

exports.get = async (req, res) => {
  const e = await Equipment.findById(req.params.id);
  if (!e) return res.status(404).json({ message: 'Introuvable' });
  const units = await Unit.find({ equipment: e._id });
  res.json({ ...e.toObject(), units });
};

exports.create = async (req, res) => {
  const e = await Equipment.create({ ...req.body, stockDisponible: req.body.stockTotal || 0 });
  res.status(201).json(e);
};

exports.update = async (req, res) => {
  const e = await Equipment.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!e) return res.status(404).json({ message: 'Introuvable' });
  res.json(e);
};

exports.remove = async (req, res) => {
  await Equipment.findByIdAndDelete(req.params.id);
  await Unit.deleteMany({ equipment: req.params.id });
  res.json({ ok: true });
};

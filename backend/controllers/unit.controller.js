const Unit = require('../models/Unit');
const Equipment = require('../models/Equipment');

exports.list = async (req, res) => {
  const filter = {};
  if (req.query.equipment) filter.equipment = req.query.equipment;
  if (req.query.status) filter.status = req.query.status;
  const units = await Unit.find(filter).populate('equipment', 'nom reference').sort('-createdAt');
  res.json(units);
};

exports.create = async (req, res) => {
  const { equipment, serialNumber } = req.body;
  const eq = await Equipment.findById(equipment);
  if (!eq) return res.status(404).json({ message: 'Équipement introuvable' });
  const unit = await Unit.create({ equipment, serialNumber, status: 'available' });
  eq.stockTotal += 1;
  eq.stockDisponible += 1;
  await eq.save();
  res.status(201).json(unit);
};

exports.update = async (req, res) => {
  const u = await Unit.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!u) return res.status(404).json({ message: 'Introuvable' });
  res.json(u);
};

exports.remove = async (req, res) => {
  const u = await Unit.findById(req.params.id);
  if (!u) return res.status(404).json({ message: 'Introuvable' });
  if (u.status === 'rented') return res.status(400).json({ message: 'Unité actuellement louée' });
  const eq = await Equipment.findById(u.equipment);
  if (eq) {
    eq.stockTotal = Math.max(0, eq.stockTotal - 1);
    if (u.status === 'available') eq.stockDisponible = Math.max(0, eq.stockDisponible - 1);
    await eq.save();
  }
  await u.deleteOne();
  res.json({ ok: true });
};

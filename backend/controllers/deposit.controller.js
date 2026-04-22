const Deposit = require('../models/Deposit');

exports.list = async (req, res) => {
  const filter = {};
  if (req.query.order) filter.order = req.query.order;
  const items = await Deposit.find(filter)
    .populate({ path: 'order', populate: { path: 'client', select: 'nom' } })
    .sort('-createdAt');
  res.json(items);
};

exports.create = async (req, res) => {
  const { order, amount, method, notes } = req.body;
  if (!order || amount == null) return res.status(400).json({ message: 'Champs requis' });
  const exists = await Deposit.findOne({ order });
  if (exists) return res.status(409).json({ message: 'Caution déjà enregistrée pour cette commande' });
  const d = await Deposit.create({ order, amount, method, notes, status: 'held' });
  res.status(201).json(d);
};

exports.setStatus = async (req, res) => {
  const { status, deductedAmount, notes } = req.body;
  if (!['held', 'returned', 'deducted'].includes(status))
    return res.status(400).json({ message: 'Statut invalide' });
  const d = await Deposit.findById(req.params.id);
  if (!d) return res.status(404).json({ message: 'Introuvable' });
  d.status = status;
  if (deductedAmount != null) d.deductedAmount = deductedAmount;
  if (notes != null) d.notes = notes;
  if (status !== 'held') d.resolvedAt = new Date();
  await d.save();
  res.json(d);
};

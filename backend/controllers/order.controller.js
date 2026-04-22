const Order = require('../models/Order');
const Equipment = require('../models/Equipment');
const Unit = require('../models/Unit');
const Deposit = require('../models/Deposit');

exports.list = async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const orders = await Order.find(filter)
    .populate('client', 'nom telephone')
    .populate('equipment', 'nom reference')
    .populate('unit', 'serialNumber')
    .sort('-createdAt');
  res.json(orders);
};

exports.get = async (req, res) => {
  const o = await Order.findById(req.params.id)
    .populate('client').populate('equipment').populate('unit');
  if (!o) return res.status(404).json({ message: 'Introuvable' });
  res.json(o);
};

exports.create = async (req, res) => {
  const { client, equipment, unit, startDate, endDate, cautionAmount, notes } = req.body;
  if (!client || !equipment || !unit || !startDate || !endDate)
    return res.status(400).json({ message: 'Champs requis manquants' });

  const eq = await Equipment.findById(equipment);
  if (!eq) return res.status(404).json({ message: 'Équipement introuvable' });
  if (eq.stockDisponible <= 0) return res.status(400).json({ message: 'Aucun stock disponible' });

  const u = await Unit.findById(unit);
  if (!u) return res.status(404).json({ message: 'Unité introuvable' });
  if (u.status !== 'available') return res.status(400).json({ message: 'Unité indisponible' });
  if (String(u.equipment) !== String(equipment))
    return res.status(400).json({ message: 'Unité ne correspond pas à l\'équipement' });

  const order = await Order.create({
    client, equipment, unit,
    startDate, endDate,
    prixJournalier: eq.prixJournalier,
    cautionAmount: cautionAmount ?? eq.cautionDefaut,
    status: 'pending',
    createdBy: req.user?._id,
    notes,
  });

  u.status = 'rented';
  u.currentOrder = order._id;
  await u.save();
  eq.stockDisponible = Math.max(0, eq.stockDisponible - 1);
  await eq.save();

  res.status(201).json(order);
};

exports.setStatus = async (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'confirmed', 'active', 'ended', 'cancelled'];
  if (!allowed.includes(status)) return res.status(400).json({ message: 'Statut invalide' });

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Introuvable' });

  // Caution obligatoire avant activation
  if (status === 'active') {
    const dep = await Deposit.findOne({ order: order._id });
    if (!dep || dep.status !== 'held')
      return res.status(400).json({ message: 'Caution obligatoire avant activation' });
  }

  // Fin de location → libérer unité + stock
  if (status === 'ended' && order.status !== 'ended') {
    const u = await Unit.findById(order.unit);
    if (u) {
      u.status = 'available';
      u.currentOrder = null;
      await u.save();
    }
    const eq = await Equipment.findById(order.equipment);
    if (eq) {
      eq.stockDisponible += 1;
      await eq.save();
    }
    order.endedAt = new Date();
  }

  if (status === 'cancelled' && order.status !== 'cancelled' && order.status !== 'ended') {
    const u = await Unit.findById(order.unit);
    if (u && u.status === 'rented') {
      u.status = 'available'; u.currentOrder = null; await u.save();
    }
    const eq = await Equipment.findById(order.equipment);
    if (eq) { eq.stockDisponible += 1; await eq.save(); }
  }

  order.status = status;
  await order.save();
  res.json(order);
};

const Payment = require('../models/Payment');
const Order = require('../models/Order');

exports.list = async (req, res) => {
  const filter = {};
  if (req.query.order) filter.order = req.query.order;
  const payments = await Payment.find(filter)
    .populate({ path: 'order', populate: { path: 'client', select: 'nom' } })
    .populate('receivedBy', 'name')
    .sort('-createdAt');
  res.json(payments);
};

exports.create = async (req, res) => {
  const { order, amount, method, notes } = req.body;
  if (!order || !amount || !method) return res.status(400).json({ message: 'Champs requis' });
  const o = await Order.findById(order);
  if (!o) return res.status(404).json({ message: 'Commande introuvable' });
  const pay = await Payment.create({ order, amount, method, notes, receivedBy: req.user?._id });
  res.status(201).json(pay);
};

exports.receipt = async (req, res) => {
  const p = await Payment.findById(req.params.id)
    .populate({ path: 'order', populate: [{ path: 'client' }, { path: 'equipment' }] })
    .populate('receivedBy', 'name');
  if (!p) return res.status(404).json({ message: 'Introuvable' });
  res.json({
    receiptNumber: p.reference,
    date: p.createdAt,
    client: p.order?.client?.nom,
    equipment: p.order?.equipment?.nom,
    orderRef: p.order?.reference,
    amount: p.amount,
    method: p.method,
    receivedBy: p.receivedBy?.name,
  });
};

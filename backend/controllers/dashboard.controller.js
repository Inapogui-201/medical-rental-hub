const Order = require('../models/Order');
const Equipment = require('../models/Equipment');
const Payment = require('../models/Payment');

exports.summary = async (_req, res) => {
  const activeOrders = await Order.countDocuments({ status: 'active' });
  const equipments = await Equipment.find();
  const stockDispo = equipments.reduce((s, e) => s + (e.stockDisponible || 0), 0);
  const stockTotal = equipments.reduce((s, e) => s + (e.stockTotal || 0), 0);

  const startMonth = new Date(); startMonth.setDate(1); startMonth.setHours(0, 0, 0, 0);
  const monthlyAgg = await Payment.aggregate([
    { $match: { createdAt: { $gte: startMonth } } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const revenueMonth = monthlyAgg[0]?.total || 0;

  // alertes : locations actives finissant dans <= 3 jours
  const in3 = new Date(Date.now() + 3 * 86400000);
  const endingSoon = await Order.find({ status: 'active', endDate: { $lte: in3 } })
    .populate('client', 'nom telephone')
    .populate('equipment', 'nom')
    .sort('endDate')
    .limit(10);

  res.json({ activeOrders, stockDispo, stockTotal, revenueMonth, endingSoon });
};

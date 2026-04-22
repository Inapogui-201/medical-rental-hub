const Client = require('../models/Client');

exports.list = async (req, res) => {
  const q = req.query.q
    ? { $or: [{ nom: new RegExp(req.query.q, 'i') }, { telephone: new RegExp(req.query.q, 'i') }, { cin: new RegExp(req.query.q, 'i') }] }
    : {};
  const clients = await Client.find(q).sort('-createdAt');
  res.json(clients);
};

exports.get = async (req, res) => {
  const c = await Client.findById(req.params.id);
  if (!c) return res.status(404).json({ message: 'Introuvable' });
  res.json(c);
};

exports.create = async (req, res) => {
  const c = await Client.create(req.body);
  res.status(201).json(c);
};

exports.update = async (req, res) => {
  const c = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!c) return res.status(404).json({ message: 'Introuvable' });
  res.json(c);
};

exports.remove = async (req, res) => {
  await Client.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
};

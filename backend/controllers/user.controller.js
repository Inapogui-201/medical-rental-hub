const User = require('../models/User');

exports.list = async (_req, res) => {
  const users = await User.find().select('-password').sort('-createdAt');
  res.json(users);
};

exports.update = async (req, res) => {
  const { name, role, active, password } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'Introuvable' });
  if (name !== undefined) user.name = name;
  if (role !== undefined) user.role = role;
  if (active !== undefined) user.active = active;
  if (password) user.password = password;
  await user.save();
  res.json({ id: user._id, name: user.name, email: user.email, role: user.role, active: user.active });
};

exports.remove = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
};

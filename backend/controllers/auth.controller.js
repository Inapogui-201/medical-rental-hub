const jwt = require('jsonwebtoken');
const User = require('../models/User');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email et mot de passe requis' });
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.active) return res.status(401).json({ message: 'Identifiants invalides' });
  const ok = await user.matchPassword(password);
  if (!ok) return res.status(401).json({ message: 'Identifiants invalides' });
  res.json({
    token: sign(user._id),
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

exports.me = async (req, res) => {
  res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role } });
};

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Champs requis manquants' });
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return res.status(409).json({ message: 'Email déjà utilisé' });
  const user = await User.create({ name, email: email.toLowerCase(), password, role: role || 'employe' });
  res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
};

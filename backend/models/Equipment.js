const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true, trim: true },
  nom: { type: String, required: true, trim: true },
  description: { type: String },
  prixJournalier: { type: Number, required: true, min: 0 },
  cautionDefaut: { type: Number, default: 0, min: 0 },
  stockTotal: { type: Number, default: 0, min: 0 },
  stockDisponible: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Equipment', equipmentSchema);

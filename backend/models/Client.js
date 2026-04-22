const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  nom: { type: String, required: true, trim: true },
  telephone: { type: String, required: true, trim: true },
  adresse: { type: String, trim: true },
  cin: { type: String, trim: true, index: true },
  gps: {
    lat: { type: Number },
    lng: { type: Number },
  },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);

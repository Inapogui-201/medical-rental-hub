const mongoose = require('mongoose');

const UNIT_STATUS = ['available', 'rented', 'maintenance', 'lost'];

const unitSchema = new mongoose.Schema({
  equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
  serialNumber: { type: String, required: true, unique: true, trim: true },
  status: { type: String, enum: UNIT_STATUS, default: 'available' },
  currentOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
}, { timestamps: true });

unitSchema.statics.STATUS = UNIT_STATUS;
module.exports = mongoose.model('Unit', unitSchema);

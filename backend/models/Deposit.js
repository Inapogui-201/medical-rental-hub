const mongoose = require('mongoose');

const DEPOSIT_STATUS = ['held', 'returned', 'deducted'];

const depositSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  amount: { type: Number, required: true, min: 0 },
  method: { type: String, enum: ['cash', 'carte', 'virement'], default: 'cash' },
  status: { type: String, enum: DEPOSIT_STATUS, default: 'held' },
  deductedAmount: { type: Number, default: 0 },
  notes: { type: String },
  resolvedAt: { type: Date },
}, { timestamps: true });

depositSchema.statics.STATUS = DEPOSIT_STATUS;
module.exports = mongoose.model('Deposit', depositSchema);

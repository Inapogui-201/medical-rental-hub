const mongoose = require('mongoose');

const ORDER_STATUS = ['pending', 'confirmed', 'active', 'ended', 'cancelled'];

const orderSchema = new mongoose.Schema({
  reference: { type: String, unique: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  prixJournalier: { type: Number, required: true, min: 0 },
  totalEstime: { type: Number, default: 0 },
  status: { type: String, enum: ORDER_STATUS, default: 'pending' },
  cautionAmount: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  endedAt: { type: Date },
  notes: { type: String },
}, { timestamps: true });

orderSchema.pre('validate', function (next) {
  if (!this.reference) {
    this.reference = 'CMD-' + Date.now().toString(36).toUpperCase();
  }
  if (this.startDate && this.endDate) {
    const days = Math.max(1, Math.ceil((this.endDate - this.startDate) / 86400000));
    this.totalEstime = days * this.prixJournalier;
  }
  next();
});

orderSchema.statics.STATUS = ORDER_STATUS;
module.exports = mongoose.model('Order', orderSchema);

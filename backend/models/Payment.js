const mongoose = require('mongoose');

const PAYMENT_METHODS = ['cash', 'carte', 'virement'];

const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  amount: { type: Number, required: true, min: 0 },
  method: { type: String, enum: PAYMENT_METHODS, required: true },
  reference: { type: String, unique: true },
  receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
}, { timestamps: true });

paymentSchema.pre('validate', function (next) {
  if (!this.reference) this.reference = 'PAY-' + Date.now().toString(36).toUpperCase();
  next();
});

paymentSchema.statics.METHODS = PAYMENT_METHODS;
module.exports = mongoose.model('Payment', paymentSchema);

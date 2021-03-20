const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    product: {},
    paymentStatus: {
      type: String,
      enum: ['paid via card', 'cash on delivery'],
      default: 'paid via card'
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is not defined!']
    }
  },
  {
    timestamps: true
  }
);

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;

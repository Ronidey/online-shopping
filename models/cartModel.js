const mongoose = require('mongoose');
const cartSchema = new mongoose.Schema({
  items: [
    {
      _id: String,
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      size: String,
      qty: {
        type: Number,
        default: 1
      }
    }
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is not defined!']
  }
});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;

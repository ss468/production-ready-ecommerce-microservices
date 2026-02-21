const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  products: [{
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    description: String,
    price: Number,
    stock: Number,
  }],
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  user: {
    type: String,
  },
  status: {
    type: String,
    enum: ['created', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'created',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { collection : 'orders' });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

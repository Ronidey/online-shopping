const Cart = require('../models/cartModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// ---------- For Testing Only ----------
exports.createCart = catchAsync(async (req, res, next) => {
  await Cart.create({ user: req.currentUser._id });
  res.status(201).send();
});

exports.getMyCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.currentUser._id }).populate({
    path: 'items.product',
    select: 'imgUrl title currentPrice'
  });

  let totalAmount = 0;
  for (let itemObj of cart.items) {
    totalAmount += itemObj.product.currentPrice * itemObj.qty;
  }

  res.status(200).json({ items: cart.items, totalAmount });
});

exports.AddToCart = catchAsync(async (req, res, next) => {
  await Cart.findOneAndUpdate(
    { user: req.currentUser._id },
    { $push: { items: req.body } },
    { new: true }
  );

  res.status(200).send();
});

exports.removeFromCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.currentUser._id });

  // Not populating item so item is an id
  cart.items = cart.items.filter(
    (itemObj) => itemObj.product.toString() !== req.params.id
  );

  await cart.save();
  res.status(200).send();
});

exports.updateCartItemQty = catchAsync(async (req, res, next) => {
  const myCart = await Cart.findOne({ user: req.currentUser._id });

  for (let item of myCart.items) {
    if (item._id == req.params.itemId) {
      item.qty = req.body.qty;
    }
  }

  await myCart.save();
  res.status(200).send();
});

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

// ---------- For Testing Only ----------
exports.addCartItem = catchAsync(async (req, res, next) => {
  const user = req.currentUser;

  // 1) If the product already exists, increment qty
  const cartItem = user.cart.find((item) => item.product == req.body.productId);

  if (!cartItem) {
    user.cart.push({
      product: req.body.productId,
      qty: req.body.qty,
      size: req.body.size
    });
  } else {
    cartItem.qty += 1;
  }

  await user.save({ validateBeforeSave: false });
  res.json({ itemsCount: user.cart.length, cart: user.cart });
});

exports.getMyCart = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.currentUser._id).populate({
    path: 'cart.product',
    select: 'title imgUrl currentPrice'
  });

  res.json({
    itemsCount: user.cart.length,
    cart: user.cart
  });
});

// Remove Cart Item

exports.removeCartItem = catchAsync(async (req, res, next) => {
  const user = req.currentUser;

  // 1) Filter the product
  user.cart = user.cart.filter(
    (item) => item.product._id != req.params.productId
  );

  await user.save({ validateBeforeSave: false });
  res.json({ itemsCount: user.cart.length, cart: user.cart });
});

exports.updateCartItem = catchAsync(async (req, res, next) => {
  const user = req.currentUser;
  const cartItem = user.cart.find(
    (item) => item.product._id == req.params.productId
  );

  cartItem.qty = req.body.qty || cartItem.qty;
  cartItem.size = req.body.size || cartItem.size;

  await user.save({ validateBeforeSave: false });
  res.json({ itemsCount: user.cart.length, cart: user.cart });
});

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.getMyWishlist = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.currentUser._id).populate({
    path: 'wishlist.product',
    select: 'imgUrl title currentPrice'
  });

  res.json({ wishlist: user.wishlist });
});

exports.addToWishlist = catchAsync(async (req, res, next) => {
  const user = req.currentUser;

  user.wishlist.push({ product: req.params.productId });
  await user.save({ validateBeforeSave: false });
  res.json({ wishlist: user.wishlist });
});

exports.removeFromWishlist = catchAsync(async (req, res, next) => {
  const user = req.currentUser;

  user.wishlist = user.wishlist.filter(
    (doc) => doc.product._id.toString() !== req.params.productId
  );

  await user.save({ validateBeforeSave: false });
  res.json({ wishlist: user.wishlist });
});

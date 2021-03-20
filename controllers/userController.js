const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getMyProfile = catchAsync(async (req, res, next) => {
  res.status(200).json({
    user: req.currentUser
  });
});

exports.deleteMyAccount = catchAsync(async (req, res, next) => {
  await User.findByIdAndDelete(req.currentUser._id);

  // removing jwt cookie
  res.cookie('jwt', '', {
    maxAge: 1000 * 2,
    httpOnly: true
  });

  res.status(204).send();
});

// exports.getAllUsers = catchAsync(async (req, res, next) => {
//   const users = await User.find(req.query);

//   res.status(200).json({
//     results: users.length,
//     doc: users
//   });
// });

// exports.getUserById = catchAsync(async (req, res, next) => {
//   const user = await User.findById(req.params.id);
//   res.status(200).json({
//     doc: user
//   });
// });

// exports.deleteUser = catchAsync(async (req, res, next) => {
//   const user = await User.findByIdAndDelete(req.params.id);

//   if (!user) return next(new AppError('No user found with the given ID', 404));
//   res.status(204).send();
// });

exports.updateMyWishlist = catchAsync(async (req, res, next) => {
  const user = req.currentUser;
  const isInWishlist = user.wishlist.find(
    (doc) => doc._id.toString() === req.params.productId
  );

  if (!isInWishlist) {
    user.wishlist.push(req.params.productId);
  } else {
    user.wishlist = user.wishlist.filter(
      (doc) => doc._id.toString() !== req.params.productId
    );
  }

  await user.save();
  res.status(200).send();
});

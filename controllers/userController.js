const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const Order = require('../models/OrderModel');

exports.getMyProfile = catchAsync(async (req, res, next) => {
  res.status(200).json({
    user: req.currentUser
  });
});

exports.deleteMyAccount = catchAsync(async (req, res, next) => {
  await User.findByIdAndDelete(req.currentUser._id);
  await Order.deleteMany({ user: req.currentUser._id });

  // removing jwt cookie
  res.cookie('jwt', '', {
    maxAge: 1000 * 2,
    httpOnly: true
  });

  res.status(204).send();
});

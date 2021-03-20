const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Cart = require('../models/cartModel');

const createSendToken = async (user, res, httpStatus) => {
  const token = await promisify(jwt.sign)(
    { id: user._id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES
    }
  );

  res.cookie('jwt', token, {
    maxAge: 1000 * 60 * 60 * 24 * 2, // cookie expires 2d
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development'
  });

  res.status(httpStatus).json({
    user,
    token
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password
  });

  await Cart.create({ user: user._id });
  createSendToken(user, res, 201);
});

exports.login = catchAsync(async (req, res, next) => {
  if (!req.body.email || !req.body.password)
    return next(new AppError('Please enter valid email and password!', 400));

  const user = await User.findOne({ email: req.body.email }).select(
    '+password'
  );

  if (!user)
    return next(
      new AppError('No user found with the given Email! please Signup', 404)
    );

  const isMatch = await user.verifyPassword(req.body.password, user.password);

  if (!isMatch) return next(new AppError('Invalid email and password!', 401));

  // preventing password from getting sent to the user
  user.password = undefined;

  createSendToken(user, res, 200);
});

exports.logout = (req, res) => {
  res.cookie('jwt', '', {
    maxAge: 1000 * 2,
    httpOnly: true
  });

  res.send();
};

exports.protect = catchAsync(async (req, res, next) => {
  if (!req.cookies.jwt && !req.headers.authorization) {
    return next(
      new AppError('You are not authenticated!!! Please login!', 401)
    );
  }

  const token =
    req.cookies.jwt || req.headers.authorization.split('Bearer ')[1];

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);

  if (!user) return next(new AppError('Invalid token!! Please login.', 401));

  if (user.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('Invalid token! please login!', 401));
  }

  req.currentUser = user;
  next();
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.currentUser._id).select('+password');

  if (!(await user.verifyPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Your current password is incorrect!', 400));
  }

  user.password = req.body.newPassword;
  await user.save();

  createSendToken(user, res, 200);
});

exports.isLoggedIn = async (req, res, next) => {
  try {
    if (!req.cookies.jwt) return next();

    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id);

    if (!user) return next();

    if (user.changedPasswordAfter(decoded.iat)) {
      return next();
    }

    req.currentUser = user;
    next();
  } catch (err) {
    next();
  }
};

exports.isAuthenticated = (req, res) => {
  res.status(200).json({ user: req.currentUser });
};

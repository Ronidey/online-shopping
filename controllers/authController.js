const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const createSendToken = async (user, res, httpStatus) => {
  const token = await promisify(jwt.sign)(
    { id: user._id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES
    }
  );

  user.tokens = [...user.tokens, token];
  await user.save({ validateBeforeSave: false });

  res.cookie('jwt', token, {
    maxAge: 1000 * 60 * 60 * 24 * 90, // cookie expires 90d
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

  createSendToken(user, res, 201);
});

exports.login = catchAsync(async (req, res, next) => {
  if (!req.body.email || !req.body.password)
    return next(new AppError('Please enter valid email and password!', 400));

  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    createSendToken(user, res, 200);
  } catch (err) {
    return next(new AppError(err.message, 401));
  }
});

exports.logout = catchAsync(async (req, res, next) => {
  const token =
    req.cookies.jwt || req.headers.authorization.split('Bearer ')[1];

  req.currentUser.tokens = req.currentUser.tokens.filter((t) => t != token);
  await req.currentUser.save({ validateBeforeSave: false });

  res.cookie('jwt', '', {
    maxAge: 1000 * 2,
    httpOnly: true
  });

  res.send();
});

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

  if (!user.tokens.includes(token)) {
    return next(new AppError('You token has expired! please login again', 401));
  }

  req.currentUser = user;
  next();
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.currentUser._id);

  if (!(await user.verifyPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Your current password is incorrect!', 400));
  }

  user.password = req.body.newPassword;
  await user.save();

  createSendToken(user, res, 200);
});

exports.isLoggedIn = async (req, res, next) => {
  try {
    const token =
      req.cookies.jwt || req.headers.authorization.split('Bearer ')[1];
    if (!token) return next();

    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id);

    if (!user) return next();

    if (!user.tokens.includes(token)) {
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

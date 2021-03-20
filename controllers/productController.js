const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllProducts = catchAsync(async (req, res, next) => {
  let queryObj = { ...req.query };
  ['sort', 'fields', 'page', 'limit', 'search'].forEach(
    (f) => delete queryObj[f]
  );

  // ------------- Quering -----------------
  const sort = req.query.sort || '-createdAt';
  const fields = req.query.fields
    ? req.query.fields.split(',').join(' ')
    : '-__v';
  const page = req.query.page ? req.query.page * 1 : 1;
  const limit = req.query.limit ? req.query.limit * 1 : 5;
  const skip = (page - 1) * limit;

  let products = await Product.find(queryObj)
    .sort(sort)
    .select(fields)
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    results: products.length,
    docs: products
  });
});

exports.getSearchResults = catchAsync(async (req, res, next) => {
  const results = await Product.find({ $text: { $search: req.query.q } })
    .limit(20)
    .select('title currentPrice oldPrice imgUrl category');

  res.status(200).json({
    resultsCount: results.length,
    results: results
  });
});

exports.getProductById = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) return next(new AppError('No product found!!', 404));
  res.status(200).json({
    product
  });
});

exports.getProductsByCategory = catchAsync(async (req, res, next) => {
  req.query = { ...req.query, category: req.params.category };
  next();
});

exports.createProduct = catchAsync(async (req, res, next) => {
  const product = await Product.create(req.body);

  res.status(201).json({
    doc: product
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  let product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!product)
    return next(new AppError('No product found with the given ID', 404));

  res.status(200).json({
    doc: product
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product)
    return next(new AppError('No product found with the given ID', 404));

  res.status(204).send();
});

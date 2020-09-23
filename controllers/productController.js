const Product = require("../models/Product");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

module.exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) {
    return next(new AppError("Product not found"));
  }
  res.status(200).json({
    status: "success",
    product,
  });
});

module.exports.createProduct = catchAsync(async (req, res, next) => {
  const product = await Product.create(req.body);
  if (!product) {
    return next(new AppError("Failed to create Product"));
  }
  res.status(200).json({
    status: "success",
    product,
  });
});

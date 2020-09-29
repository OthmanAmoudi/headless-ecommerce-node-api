const Review = require("../models/Review");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

module.exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id)
    .populate("user")
    .populate("product");
  if (!review) {
    return next(new AppError("Can not find review", 404));
  }
  res.status(200).json({
    status: "success",
    review,
  });
});

module.exports.createReview = catchAsync(async (req, res) => {
  const review = await Review.create({ ...req.body, user: req.user._id });
  res.status(200).json({
    status: "success",
    review,
  });
});

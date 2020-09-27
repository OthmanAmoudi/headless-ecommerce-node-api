const Review = require("../models/Review");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

module.exports.getReview = catchAsync(async (req, res, next) => {
  console.log(req.params.id);
  const review = await Review.findById(req.params.id);
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

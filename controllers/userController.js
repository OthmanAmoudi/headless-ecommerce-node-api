const User = require("../models/User");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

module.exports.currentUser = (req, res) => {
  res.status(200).json({
    status: "success",
    message: "you are logged in",
    user: req.user,
  });
};

module.exports.getUserByEmail = catchAsync(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  res.status(200).json({
    status: 200,
    user,
  });
});

module.exports.admin = async (req, res) => {
  res.status(200).json({
    status: "success",
    message: "you are admin",
  });
};

const User = require("../models/User");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { createToken } = require("./authController");

module.exports.currentUser = (req, res) => {
  res.status(200).json({
    status: "success",
    message: "you are logged in",
    user: req.user,
  });
};

module.exports.changeUserPassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findOne({ email: req.user.email }).select(
    "+password"
  );

  const isPassCorrect = await user.checkPassword(
    currentPassword,
    user.password
  );

  if (!isPassCorrect) {
    return next(new AppError("current password is incorrect", 400));
  }

  user.password = newPassword;
  user.passwordConfirm = newPassword;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "password changed successfully, please login again",
  });
});

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

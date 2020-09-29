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

module.exports.createAddress = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses.push(req.body);
  await user.save({ validateBeforeSave: false });
  res.status(200).json({
    status: "success",
    message: "address added",
  });
});

module.exports.getAddress = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.filter(
    (obj) => obj._id.toString() === req.body.address
  );
  if (address.length < 1) {
    return next(new AppError("Address not found", 404));
  }
  res.status(200).json({
    status: "success",
    address,
  });
});

module.exports.updateAddress = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const newaddresses = user.addresses.filter(
    (obj) => obj._id.toString() !== req.body.address
  );
  newaddresses.push(req.body.newaddress);
  user.addresses = newaddresses;
  await user.save({ validateBeforeSave: false });
  res.status(200).json({
    status: "success",
    message: "address updated successfully",
  });
});

module.exports.deleteAddress = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const newaddresses = user.addresses.filter(
    (obj) => obj._id.toString() !== req.body.address
  );
  user.addresses = newaddresses;
  await user.save({ validateBeforeSave: false });
  res.status(200).json({
    status: "success",
    message: "address deleted successfully",
  });
});

module.exports.admin = async (req, res) => {
  res.status(200).json({
    status: "success",
    message: "you are admin",
  });
};

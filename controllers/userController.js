const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");
const { createToken } = require("./authController");

module.exports.currentUser = (req, res) => {
  res.status(200).json({
    status: "success",
    message: "you are logged in",
    user: req.user,
  });
};

module.exports.getUserByEmail = catchAsync(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  const jwt = createToken(user);
  res.status(200).json({
    status: 200,
    user,
    jwt,
  });
});

module.exports.admin = async (req, res) => {
  res.status(200).json({
    status: "success",
    message: "you are admin",
  });
};

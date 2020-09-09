const User = require("../models/User");
const { createToken } = require("./authController");

module.exports.currentUser = (req, res) => {
  res.status(200).json({
    status: 200,
    message: "you are logged in, below your information",
    user: req.user,
  });
};

module.exports.getUserByEmail = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email }); //.select("+password");
    const jwt = createToken(user);
    res.status(200).json({
      status: 200,
      user,
      jwt,
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
      message: "Error Finding user by email",
      error,
    });
  }
};

module.exports.admin = async (req, res) => {
  res.status(200).json({
    status: 200,
    message: "you are admin",
  });
};

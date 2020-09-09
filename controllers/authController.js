const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const AppError = require("../utils/AppError");

module.exports.createToken = (data) => {
  return jwt.sign({ data }, process.env.TOKEN_SECRET, {
    expiresIn: 60 * 60 * (24 * 12),
  });
};

module.exports.login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email }).select(
      "+password"
    );
    const isPasswordMatch = await user.checkPassword(
      req.body.password,
      user.password
    );

    if (!user || !isPasswordMatch) {
      console.log("throwingggg...");
      return next("user or password does not match");
    }
    user.password = undefined;
    let token = this.createToken(user);
    res.cookie("token", token);
    res.status(200).json({
      status: 200,
      token,
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
      message: "Error Finding user by email",
      error,
    });
  }
};

module.exports.logout = (req, res) => {
  req.user = undefined;
  res.clearCookie("token");
  res.status(200).json({
    status: 200,
    message: "user logged out",
  });
};

module.exports.signup = async (req, res) => {
  try {
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });
    user.password = undefined;
    let token = this.createToken(user);
    res.status(200).json({
      status: 200,
      message: "Registration Successful",
      token,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      status: 500,
      error: e,
      message: "Failed to register user",
    });
  }
};

//only singed in users
module.exports.protect = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    let token;

    if (authorization && authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError("No Token Provided", 500));
    }

    const decoded = await promisify(jwt.verify)(
      token,
      process.env.TOKEN_SECRET
    );
    req.user = decoded.data;
    console.log("Authorized");
    next();
  } catch (error) {
    console.log("==error==");
    return next(error);
  }
};

//only admin user
module.exports.restrictTo = (...rest) => {
  return (req, _res, next) => {
    if (rest.includes(req.user.role)) {
      next();
    }
    return next("Not Allowed to access this route");
  };
};

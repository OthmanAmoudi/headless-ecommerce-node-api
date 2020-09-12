const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const createToken = (data) => {
  return jwt.sign({ data }, process.env.TOKEN_SECRET, {
    expiresIn: 60 * 60 * (24 * 12),
  });
};

const sendToken = (user, statusCode, res) => {
  user.password = undefined;
  const token = createToken(user);
  res.cookie("jwt", token, {
    expires: new Date(Date.now() + 60 * 60 * (24 * 12)),
    httpOnly: true,
  });
  res.status(statusCode).json({
    status: "success",
    token,
    user,
  });
};

module.exports.login = catchAsync(async (req, res, next) => {
  const { password, email } = req.body;

  if (!password || !email) {
    return next(new AppError("Please provide both password and email", 400));
  }

  const user = await User.findOne({ email: req.body.email }).select(
    "+password"
  );

  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(new AppError("Password or email was incorrect"));
  }

  sendToken(user, 200, res);
});

module.exports.signup = catchAsync(async (req, res, next) => {
  const { name, password, passwordConfirm, email } = req.body;
  const user = await User.create({ name, email, password, passwordConfirm });
  sendToken(user, 200, res);
});

module.exports.logout = (req, res) => {
  let message;
  if (req.user) {
    message = "logging user out";
  } else {
    message = "user already logged out";
  }
  req.user = undefined;
  res.clearCookie("token");
  res.status(200).json({
    status: 200,
    message,
  });
};

module.exports.protect = catchAsync(async (req, res, next) => {
  const { authorization } = req.headers;

  let token;

  if (authorization && authorization.startsWith("Bearer")) {
    token = authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("You Must Sign in", 400));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.TOKEN_SECRET);

  req.user = decoded.data;
  next();
});

module.exports.restrictTo = (...rest) => {
  return (req, res, next) => {
    if (rest.includes(req.user.role)) {
      next();
    }
    return next(new AppError("Not Allowed to access this route", 500));
  };
};

const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const crypto = require("crypto");

const createToken = (data) => {
  return jwt.sign({ data }, process.env.TOKEN_SECRET, {
    expiresIn: 60 * 60 * (24 * 12),
  });
};

const sendToken = (data, statusCode, res) => {
  const token = createToken({ _id: data._id });
  res.cookie("jwt", token, {
    expires: new Date(Date.now() + 60 * 60 * (24 * 12)),
    httpOnly: true,
  });
  res.status(statusCode).json({
    status: "success",
    token,
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

  req.user = user;
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

  const user = await User.findById(decoded.data);

  if (!user) {
    return next(
      new AppError("User belongint to this token does not exist", 401)
    );
  }

  if (user.changedPasswordAt(decoded.iat)) {
    return next(
      new AppError("This user's password changed please login again", 401)
    );
  }

  req.user = decoded.data;
  next();
});

module.exports.notLoggedIn = catchAsync(async (req, res, next) => {
  const { authorization } = req.headers;

  if (authorization) {
    return next(new AppError("you cant perform that action", 500));
  }
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

module.exports.changeUserPassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");

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
  sendToken(user._id, 200, res);
});

module.exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("Email does not exist", 401));
  }

  console.log(Date.now(), new Date(user.passwordResetExpires).getTime());
  if (Date.now() < new Date(user.passwordResetExpires).getTime()) {
    return next(new AppError("reset token already sent"));
  }
  const resetToken = user.createPasswordResetToken();
  //send email HERE
  await user.save({ validateBeforeSave: false });
  res.status(200).json({
    status: "success",
    message: "an email has been sent to reset the password",
    testlink: `reset/${resetToken}`,
  });
});

module.exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { newPassword, newPasswordConfirm } = req.body;
  const encryptedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({ passwordResetToken: encryptedToken });

  if (!user) {
    return next(new AppError("reset token does not exist"));
  }

  if (Date.now() > new Date(user.passwordResetExpires).getTime()) {
    return next(
      new AppError(
        "reset token expired after 10 mintues, please request a new one again"
      )
    );
  }

  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.status(200).json({
    status: "success",
    message: "Password Changed Successfully",
    //token
  });
});

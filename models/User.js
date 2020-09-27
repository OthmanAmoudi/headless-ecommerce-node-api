const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const validator = require("validator");
const userSchema = mongoose.Schema({
  name: {
    type: String,
    lowercase: true,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
    minlength: 5,
    maxlength: 255,
    validate: {
      validator: function (email) {
        return validator.isEmail(email);
      },
      message: "email has to be a valid format",
    },
  },
  password: {
    type: String,
    required: [true, "Please Provide a Password"],
    minlength: [8, "Password must be at least 8 charachters"],
    maxlength: [255, "Password can not exceed 255 charachters"],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please Confirm your Password"],
    validate: {
      validator: function (passConf) {
        return passConf === this.password;
      },
      message: "Passwords do not match",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  role: {
    type: String,
    default: "user",
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) {
    return next();
  }
  this.passwordChangedAt = Date.now() - 10000;
  next();
});

userSchema.methods.checkPassword = async function (
  password,
  userHashedPassword
) {
  return await bcrypt.compare(password, userHashedPassword);
};

userSchema.methods.changedPasswordAt = function (tokenIssuedAt) {
  if (this.passwordChangedAt) {
    const convertedPassTimestamp = parseInt(
      new Date(this.passwordChangedAt).getTime() / 1000,
      10
    );
    return tokenIssuedAt < convertedPassTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  const digestedResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log({ resetToken, digestedResetToken });
  this.passwordResetToken = digestedResetToken;
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model("user", userSchema);

module.exports = User;

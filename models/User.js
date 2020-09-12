const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

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
  role: {
    type: String,
    default: "user",
  },
});

userSchema.pre("save", async function () {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  this.passwordConfirm = undefined;
});

userSchema.methods.checkPassword = async function (
  password,
  userHashedPassword
) {
  return await bcrypt.compare(password, userHashedPassword);
};

const User = mongoose.model("user", userSchema);

module.exports = User;

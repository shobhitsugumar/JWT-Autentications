const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: [true, "full name is required"],
  },
  email: {
    type: String,
    unique: [true, "email alread exists in database"],
    lowecase: true,
    required: [true, "Please enter the email"],
    validator: [validator.isEmail, "PLease provide valid email"],
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    select: false,
  },
  confirmpassword: {
    type: String,
    required: [true, "Please confirm the password"],
    validate: {
      //this only works on create and save
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not same ",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = bcrypt.hash(this.password, 12);
  this.confirmpassword = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) {
    return next();
  }
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 12);

  next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedpasswordAfter = function (JWTtimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTtimestamp < changedTimestamp;
  }
  return false;
};
userSchema.methods.createResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("Hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model("user", userSchema);
module.exports = User;

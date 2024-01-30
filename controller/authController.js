const User = require("../model/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const signToken = (id) => {
  return (token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  }));
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    fullname: req.body.fullname,
    email: req.body.email,
    role: req.body.role,
    password: req.body.password,
    confirmpassword: req.body.confirmpassword,
  });

  //create the token
  signToken(newUser.id);

  res.status(200).json({
    status: "success",
    token,
    data: {
      newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1 check if user entered the user and password
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  //2 check if user exist and password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new AppError("email or password is incorrect"), 401);
  }

  //3 if everything is ok create the token and send token to the client

  signToken(user.id);

  res.status(200).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
});

//protected route
exports.protected = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("You are not logged in,please login "), 401);
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);

  const CurrentUser = await User.findById(decoded.id);
  if (!CurrentUser) {
    return next(
      new AppError("The user belonging to this token does no longer exist", 401)
    );
  }
  //check if user changed the password after the token was issued

  if (CurrentUser.changedpasswordAfter(decoded.iat)) {
    return next(new AppError("user recently changed the password", 401));
  }
  req.user = CurrentUser;
  console.log(req.user);
  next();
});

exports.profile = catchAsync(async (req, res) => {
  console.log("requser=", req.user);
  const profile = await User.findOne({ fullname: req.user.fullname });
  res.status(200).json({
    status: "success",
    data: {
      profile,
    },
  });
});

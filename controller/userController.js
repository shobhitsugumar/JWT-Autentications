const catchAsync = require("../utils/catchAsync");
const User = require("../model/userModel");

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

exports.appupdate = catchAsync(async (req, res) => {
  res.status(200).json({
    status: "success",
  });
});

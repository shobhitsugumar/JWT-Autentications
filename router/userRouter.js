const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const userController = require("../controller/userController");

router.post("/signup", authController.signup);

router.post("/login", authController.login);

//to check the protect middlware
router.get("/profile", authController.protected, userController.profile);
router.get(
  "/appupdate",
  authController.protected,
  authController.restrictTo("admin"),
  userController.appupdate
);

//router.post("/forgotpassword", authController.forgotPassword);

module.exports = router;

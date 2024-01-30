const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");

router.post("/signup", authController.signup);

router.post("/login", authController.login);

//to check the protect middlware
router.get("/profile", authController.protected, authController.profile);

module.exports = router;

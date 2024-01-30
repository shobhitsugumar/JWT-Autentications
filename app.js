const express = require("express");
const globalErrohandler = require("./controller/errorhandler");
const userRouter = require("./router/userRouter");
const AppError = require("./utils/appError");

const app = express();
app.use(express.json({ limit: "10kb" }));
//router
app.use("/api/v1", userRouter);

app.use("*", (req, res, next) => {
  next(new AppError(`cant find ${req.originalUrl} on the server`, 404));
});

app.use(globalErrohandler);

module.exports = app;

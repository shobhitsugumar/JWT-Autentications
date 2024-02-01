const express = require("express");
const globalErrohandler = require("./controller/errorhandler");
const userRouter = require("./router/userRouter");
const AppError = require("./utils/appError");
const ratelimit = require("express-rate-limit");
const helmet = require("helmet");
const mongosanitize = require("express-mongo-sanitize");

const app = express();

//helmet
app.use(helmet());

//limit rate request
const limiter = ratelimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many request from this IP, please try again after 1 hour ",
});
app.use("/api", limiter);

//monog sanitizer
app.use(mongosanitize());

app.use(express.json({ limit: "10kb" }));
//router
app.use("/api/v1", userRouter);

app.use("*", (req, res, next) => {
  next(new AppError(`cant find ${req.originalUrl} on the server`, 404));
});

app.use(globalErrohandler);

module.exports = app;

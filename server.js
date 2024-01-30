const mongoose = require("mongoose");
const app = require("./app");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE_ID.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

//CONNECTING DATABASE
mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => console.log("DB connection succesful"));

const port = 3000;

const server = app.listen(port, () => {
  console.log(`App running on ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! SHUTTING DOWN...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  console.log("SIGTERM RECEIVED.Shutting down gracefully");
  server.close(() => {
    console.log("process termianted");
  });
});

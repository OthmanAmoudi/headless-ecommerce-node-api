require("dotenv").config();
const app = require("./app");
const mongoose = require("mongoose");
//handle uncaught exceptions and shut server down gracefully
process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("UNCAUGHT EXCEPTION 💀 shutting down ...");
  process.exit(1);
});
//connect to DB
let url = process.env.DB_CONSTR.replace(
  "<DB_USERNAME>",
  process.env.DB_USERNAME
)
  .replace("<DB_PASSWORD>", process.env.DB_PASSWORD)
  .replace("<DB_NAME>", process.env.DB_NAME);

mongoose
  .connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("-- DB Connection success 🎉 --"))
  .catch((err) => console.error("Could not connect to remote MongoDB..."));

//start server
const port = process.env.PORT || 6565;
const mode = process.env.NODE_ENV || "development";

const server = app.listen(port, () => {
  console.log(
    `App Started listening at http://localhost:${port}, mode: ${mode}`
  );
});

// if any promise was rejected shutdown server
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTION 😱😱😱 shutting down ...");
  server.close(() => {
    process.exit(1);
  });
});

const express = require("express");
const app = express();
const userRoutes = require("./routes/userRoutes");
const globalErrorHandler = require("./controllers/errorController");

if (process.env.NODE_ENV == "development") app.use(require("morgan")("dev"));
app.use(express.json());
//Routes
app.use("/api/v1/users", userRoutes);
app.use(globalErrorHandler);
module.exports = app;

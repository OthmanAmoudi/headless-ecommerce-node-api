const express = require("express");
const app = express();
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");

//middlewares
if (process.env.NODE_ENV == "development") app.use(require("morgan")("dev"));
app.use(express.json());
//Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/reviews/", reviewRoutes);
//error handlers
app.all("*", (req, res, next) => {
  next(new AppError(`cant find ${req.originalUrl} on this server`, 404));
});
app.use(globalErrorHandler);
module.exports = app;

const AppError = require("../utils/appError");

const handleDuplicateFieldsDB = (error) => {
  const key = Object.keys(error.keyPattern);
  const value = error.keyValue[key];
  const message = `Duplication of ${key}, ${value} already exist`;
  return new AppError(message, 400);
};

const handleValidationFieldsDB = (error) => {
  const allErrors = [];
  const errorKeys = Object.keys(error.errors);
  errorKeys.forEach((errorKey) => {
    allErrors.push({ [errorKey]: error.errors[errorKey].properties.message });
  });
  // console.log(allErrors);
  const message = "validation fields error";
  return [new AppError(message, 400), allErrors];
};

//during 'DEVELOPMENT MODE'
const sendFullErrorLog = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
    info: err.errors,
  });
};

//during 'PRODUCTION MODE'
const sendShortErrorLog = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
const sendShortErrorLogWithValidations = (err, validations, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    validations,
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  err.validations = [] || "no validation errors";

  // console.log(err);
  if (process.env.NODE_ENV === "development") {
    sendFullErrorLog(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    // console.log();
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (Object.keys(error.errors).length > 0) {
      error = handleValidationFieldsDB(error);
      sendShortErrorLogWithValidations(error[0], error[1], res);
      return;
    }
    sendShortErrorLog(error, res);
  }
};

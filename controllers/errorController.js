const AppError = require("../utils/appError");

const handleDuplicateFieldsDB = (error) => {
  const key = Object.keys(error.keyPattern);
  const value = error.keyValue[key];
  const message = `Duplication of ${key}, ${value} already exist`;
  return new AppError(message, 400);
};

const handleValidationFieldsDB = (error) => {
  const validationErrors = [];
  const errorKeys = Object.keys(error.errors);
  errorKeys.forEach((errorKey) => {
    if (error.errors[errorKey].kind == "ObjectId") {
      validationErrors.push({
        [error.errors[errorKey].path]: "wrong id supplied or do not exist",
      });
    } else {
      validationErrors.push({
        [errorKey]: error.errors[errorKey].properties.message,
      });
    }
  });

  return [new AppError("validation fields error", 400), validationErrors];
};

const handleObjectIdDB = (error) => {
  return new AppError("Wrong id or does not exist", 404);
};

const handleJWTError = (error) =>
  new AppError(`Please log in again,${error.message}`, 401);

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
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(err.statusCode).json({
      status: "error",
      message: "something went wrong",
    });
  }
};

const sendShortErrorLogWithValidations = (err, validations, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      validations,
    });
  } else {
    res.status(err.statusCode).json({
      status: "error",
      message: "something went wrong",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  err.validations = [] || "no validation errors";

  // console.table(err);
  if (process.env.NODE_ENV === "development") {
    sendFullErrorLog(err, res);
  } else if (process.env.NODE_ENV === "production") {
    //get ride of all new Error() props but only keep message
    let msg = err.message;
    let error = { ...err, message: msg };
    // console.log("OK CATCH DB Error here");
    // console.log(error);
    // console.log("OK DoooooooonE");
    // console.table(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.kind === "ObjectId") error = handleObjectIdDB(error);
    if (Object.keys(error.errors || []).length > 0) {
      error = handleValidationFieldsDB(error);
      sendShortErrorLogWithValidations(error[0], error[1], res);
      return;
    }
    if (err.name == "JsonWebTokenError" || err.name == "TokenExpiredError") {
      error = handleJWTError(error);
    }

    sendShortErrorLog(error, res);
  }
};

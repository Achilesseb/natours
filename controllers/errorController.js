const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  err.message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(err.message, 400);
};

const handleDuplicateErrorDB = (err) => {
  const message = `Duplicate field value: ${err.keyValue.name}. Please use another value!`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const message = `Invalid input data. ${err.message}`;
  return new AppError(message, 400);
};

const handleJsonWebTokenError = () => {
  return new AppError('Invalid token! Please log in again!', 401);
};
const handleTokenExpiredError = () => {
  return new AppError('Token expired! Generate another token!', 401);
};
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
const sendErrorProduction = (err, res) => {
  if (err.isOperational) {
    //Operational => can send message to clients! Trusted error!
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    //Programming/ Unknown error=> Don`t leak error details!

    //1) Log error
    // console.error(`ERROR`, err);
    res.status(500).json({
      //2) Send generic message
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV.trim() === 'production') {
    let error = JSON.parse(JSON.stringify(err));

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateErrorDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError')
      error = handleJsonWebTokenError();
    if (error.name === 'TokenExpiredError')
      error = handleTokenExpiredError();
    sendErrorProduction(error, res);
  }
};

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');


exports.getAllUsers = catchAsync(
  async(req, res, next) => {
    const users = await User.find();
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users
      }
    });
  });
exports.getSpecificUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not yet set!',
  });
};
exports.addNewUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not yet set!',
  });
};
exports.deleteSpecificUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not yet set!',
  });
};
exports.updateSpecificUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not yet set!',
  });
};

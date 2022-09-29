const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const Tour = require("../models/tourModel");
const AppError = require("../utils/appError");

exports.getAllUsers = catchAsync(async (req, res, next) => {
   const users = await User.find();
   res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
         users,
      },
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
exports.deleteSpecificUser = catchAsync(async (req, res, next) => {
   const user = await User.findByIdAndDelete(req.params.id);
   if (!user) {
      return next(new AppError(`No user found with that ID!`, 404));
   }
   res.status(204).json({
      status: 'success',

   });
});
exports.updateSpecificUser = (req, res) => {
   res.status(500).json({
      status: 'error',
      message: 'Route not yet set!',
   });
};

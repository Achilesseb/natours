const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const filterObj = (obj, ...allowFields) => {
   const newObject = {};
   Object.keys(obj).forEach((el) => {
      if (allowFields.includes(el)) newObject[el] = obj[el];
   });
   return newObject;
};

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

exports.getSpecificUser = catchAsync(async (req, res, next) => {
   const user = await User.findById(req.params.id);
   if (!user) {
      return next(new AppError(`No user found with that ID!`, 404));
   }
   res.status(200).json({
      status: 'success',
      user: user,
   });
});
exports.addNewUser = catchAsync(async (req, res, next) => {
   const newUser = await User.create(req.body);
   res.status(200).json({
      status: 'success',
      body: {
         user: newUser,
      },
   });
});

exports.deleteSpecificUser = catchAsync(async (req, res, next) => {
   const user = await User.findByIdAndDelete(req.params.id);
   if (!user) {
      return next(new AppError(`No user found with that ID!`, 404));
   }
   res.status(204).json({
      status: 'success',
   });
});

exports.updateSpecificUser = catchAsync(async (req, res, next) => {
   const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
   });
   if (!updatedUser) {
      return next(new AppError(`No user found with that ID!`, 404));
   }
   res.status(200).json({
      status: 'success',
      body: {
         user: updatedUser,
      },
   });
});

exports.updateMe = catchAsync(async (req, res, next) => {
   //1)Create error if user POSTS password data
   if (req.body.password || req.body.passwordConfirm) {
      return next(new AppError('You can not update password from this route!', 404));
   }
   //2)Update user document
   const filteredBody = filterObj(req.body, 'name', 'email');
   const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true,
   });

   res.status(200).json({
      status: 'success',
      body: {
         user: updatedUser,
      },
   });
});

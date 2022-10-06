const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowFields) => {
   const newObject = {};
   Object.keys(obj).forEach((el) => {
      if (allowFields.includes(el)) newObject[el] = obj[el];
   });
   return newObject;
};

exports.getMe = (req, res, next) => {
   req.params.id = req.user.id;
   next();
};

exports.getAllUsers = factory.getAll(User);
exports.getSpecificUser = factory.getOne(User);
exports.addNewUser = factory.addNewOne(User);
exports.deleteSpecificUser = factory.deleteOne(User);
exports.updateSpecificUser = factory.updateOne(User);

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

exports.deleteMe = catchAsync(async (req, res, next) => {
   await User.findByIdAndUpdate(req.body.id, { active: false });
   res.status(204).json({
      status: 'success',
      data: null,
   });
});

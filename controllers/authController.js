const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const AppError = require('./../utils/appError');

const {
   createNewUser,
   checkUserLockStatus,
   sendResetPasswordEmail,
   checkPasswordOnUpdate,
   createSendToken,
} = require('../services/authService');

const User = require('../models/userModel');
const catchAsync = require('./../utils/catchAsync');

//////////////////////Sign Up function to create new user and token
exports.signup = catchAsync(async (req, res, next) => {
   const newUser = await createNewUser(req);
   createSendToken(newUser, 201, res);
});

//////////////////////Login function
exports.login = catchAsync(async (req, res, next) => {
   const { email, password } = req.body;

   // 2)Check if email and password input exists
   if (!email || !password) {
      return next(new AppError('Please provide email and password!', 404));
   }
   //3) Check if user exists && password is correct
   const user = await User.findOne({ email }).select('+password');
   //4)If everything ok send back token!
   await checkUserLockStatus(user, password, next);
   createSendToken(user, 200, res);
});

//////////////////////Protect routes function
exports.protect = catchAsync(async (req, res, next) => {
   let token;
   //1)Get token and check if exists!
   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
   }
   if (!token) {
      return next(new AppError('You are not logged in! Please log in to get access!', 401));
   }
   //2)Validate token/Verification
   const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
   //3)Check if suers still exists
   const freshUser = await User.findById(decoded.id);
   if (!freshUser) {
      return next(new AppError('The user no longer exists!', 401));
   }
   //4)Check if user changed password(token) after JWT was issued
   if (freshUser.changedPasswordAfter(decoded.iat)) {
      return next(new AppError('User recently changed password! Please log in again!', 401));
   }
   //Grant access to protected Route
   req.user = freshUser;
   next();
});

//////////////////////Restrict routes function
exports.restrictTo = (...roles) => {
   return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
         return next(new AppError('You do not have permission to perform this action', 403));
      }
      next();
   };
};

//////////////////////Forgot password function
exports.forgotPassword = catchAsync(async (req, res, next) => {
   //1)Get user based on POSTed email
   const user = await User.findOne({ email: req.body.email });
   if (!user) {
      return next(new AppError('User does`t exist! Sign up first!', 404));
   }
   //2)Generate random reset password
   const resetToken = user.createPasswordResetToken();
   await user.save({ validateBeforeSave: false });

   //3)Send it to users`s email
   await sendResetPasswordEmail(user, resetToken, req, res, next);
});

//////////////////////Reset password function
exports.resetPassword = catchAsync(async (req, res, next) => {
   //1) Get user based on token
   const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
   const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
   });
   //2)If token not expired and there is a user set new PASSWORD
   if (!user) {
      return next(new AppError('Token is invalid or has expired!', 400));
   }
   user.password = req.body.password;
   user.passwordConfirm = req.body.passwordConfirm;
   user.passwordResetToken = undefined;
   user.passwordResetExpires = undefined;
   await user.save();
   //3)Update changedPasswordAt
   //4)Log in the user in, send JWT
   createSendToken(user, 201, res);
});

//////////////////////Update password function
exports.updatePassword = catchAsync(async (req, res, next) => {
   //1)Get user from collection
   const user = await User.findById(req.user.id).select('+password');
   //2)Check if password is correct //3)If password correct update it
   await checkPasswordOnUpdate(user, req, next);
   //4) Login user, sendJWT
   createSendToken(user, 201, res);
});

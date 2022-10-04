const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const sendMail = require('../utils/email');

const { correctPassword, incrementLoginAttempts } = require('./userService');

const signToken = (id) => {
   return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
   });
};
exports.createSendToken = (user, statusCode, res) => {
   const token = signToken(user._id);
   const cookieOptions = {
      expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
      // secure: true, //=>Uses HTTPS => JUST IN PRODUCTION
      httpOnly: true, //=> PREVENTS CROSS SIDE SCRIPTING. NOT ACCESSED OR MODIFIED IN ANY WAY BY THE BROWSER!
      //RECEIVE, STORE NAD SEND WITH ANY REQUEST!
   };
   if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
   res.cookie('jwt', token, cookieOptions);

   user.password = undefined;
   res.status(statusCode).json({
      status: 'success',
      token,
      data: {
         user,
      },
   });
};

exports.createNewUser = function (req) {
   return User.create({
      // we need to do that in order to allow only the data we need to create a new user! So the can t add role like admin! Security flaw!
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      passwordChangedAt: req.body.passwordChangedAt,
      role: req.body.role,
   });
};

exports.checkUserLockStatus = async function (user, password, next) {
   if (user.isLocked) {
      await incrementLoginAttempts(user);
      return next(
         new AppError(
            `Login attempts limit reached! Try again in ${
               new Date(user.lockUntil).getMinutes() - new Date(Date.now()).getMinutes()
            } minutes!`
         )
      );
   }
   if (!user || !(await correctPassword(password, user.password))) {
      await incrementLoginAttempts(user);
      return next(new AppError('Incorrect email or password!'), 401);
   }

   user.update({ $set: { loginAttempts: 1 }, $unset: { lockUntil: 1 } }).exec();
};

exports.sendResetPasswordEmail = async function (user, resetToken, req, res, next) {
   const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
   const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\n If you didn't initialize reseting your password ignore this email!`;
   try {
      await sendMail({
         email: user.email,
         subject: 'Your password reset token (valid for 10 min)',
         message,
      });
      res.status(200).json({
         status: 'success',
         message: 'Token sent to email!',
      });
   } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new AppError('There was an error sending email! Try again later!', 500));
   }
};

exports.checkPasswordOnUpdate = async function (user, req, next) {
   if (!user) {
      return next(new AppError('You must pe logged in to perform this action!', 403));
   }
   //2) Check if posted password is correct
   if (!(await correctPassword(req.body.passwordCurrent, user.password))) {
      return next(new AppError('Password wrong! Try again or reset password!', 401));
   }
   user.password = req.body.password;
   user.passwordConfirm = req.body.password;
   await user.save();
};

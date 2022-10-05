const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const AppError = require('../utils/appError');
const sendMail = require('../utils/email');

const { correctPassword, incrementLoginAttempts } = require('./userService');

const signToken = (id) =>
   jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
   });

exports.createSendToken = (user) => {
   const token = signToken(user._id);
   const cookieOptions = {
      expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
      // secure: true, //=>Uses HTTPS => JUST IN PRODUCTION
      httpOnly: true, //=> PREVENTS CROSS SIDE SCRIPTING. NOT ACCESSED OR MODIFIED IN ANY WAY BY THE BROWSER!
      //RECEIVE, STORE NAD SEND WITH ANY REQUEST!
   };
   if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
   user.password = undefined;
   return { token, cookieOptions };
};

exports.createNewUser = function (body) {
   return User.create({
      // we need to do that in order to allow only the data we need to create a new user! So the can t add role like admin! Security flaw!
      name: body.name,
      email: body.email,
      password: body.password,
      passwordConfirm: body.passwordConfirm,
      passwordChangedAt: body.passwordChangedAt,
      role: body.role,
   });
};

exports.checkUserLockStatus = async function (user, password) {
   if (user.isLocked) {
      await incrementLoginAttempts(user);
      throw new AppError(
         `Login attempts limit reached! Try again in ${
            new Date(user.lockUntil).getMinutes() - new Date(Date.now()).getMinutes()
         } minutes!`,
         403
      );
   }
   if (!user || !(await correctPassword(password, user.password))) {
      await incrementLoginAttempts(user);
      throw new AppError('Incorrect email or password!', 401);
   }

   user.update({ $set: { loginAttempts: 1 }, $unset: { lockUntil: 1 } }).exec();
};

exports.sendResetPasswordEmail = async function (user, resetURL) {
   const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\n If you didn't initialize reseting your password ignore this email!`;
   try {
      await sendMail({
         email: user.email,
         subject: 'Your password reset token (valid for 10 min)',
         message,
      });
   } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      throw new AppError('There was an error sending email! Try again later!', 500);
   }
};

exports.checkPasswordOnUpdate = async function (user, body) {
   if (!user) throw new AppError('You must pe logged in to perform this action!', 403);

   //2) Check if posted password is correct
   if (!(await correctPassword(body.passwordCurrent, user.password)))
      throw new AppError('Password wrong! Try again or reset password!', 401);

   user.password = body.password;
   user.passwordConfirm = body.password;
   await user.save();
};

exports.updateCurrentPassword = async function (user, body) {
   if (!user) {
      throw new AppError('Token is invalid or has expired!', 400);
   }
   user.password = body.password;
   user.passwordConfirm = body.passwordConfirm;
   user.passwordResetToken = undefined;
   user.passwordResetExpires = undefined;
   await user.save();
};

const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const AppError = require('../utils/appError');
const Email = require('../utils/email');
const {
   createNewUser,
   checkUserLockStatus,
   sendResetPasswordEmail,
   checkPasswordOnUpdate,
   createSendToken,
   updateCurrentPassword,
} = require('../services/authService');

const { changedPasswordAfter, createPasswordResetToken } = require('../services/userService');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

//////////////////////Sign Up function to create new user and token
exports.signup = catchAsync(async (req, res, next) => {
   const newUser = await createNewUser(req.body);
   const { token, cookieOptions } = createSendToken(newUser);
   const url = `${req.protocol}://${req.get('host')}/me`;
   await new Email(newUser, url).sendWelcome();
   res.cookie('jwt', token, cookieOptions);
   res.status(201).json({
      status: 'success',
      token,
      data: {
         newUser,
      },
   });
});

//////////////////////Login function
exports.login = catchAsync(async (req, res, next) => {
   try {
      const { email, password } = req.body;
      // 2)Check if email and password input exists
      if (!email || !password) {
         return next(new AppError('Please provide email and password!', 404));
      }
      //3) Check if user exists && password is correct
      const user = await User.findOne({ email }).select('+password');
      //4)If everything ok send back token!
      await checkUserLockStatus(user, password);

      const { token, cookieOptions } = createSendToken(user);
      res.cookie('jwt', token, cookieOptions);
      res.status(200).json({
         status: 'success',
         token,
         data: {
            user,
         },
      });
   } catch (err) {
      next(err);
   }
});

exports.isLoggedIn = async (req, res, next) => {
   if (req.cookies.jwt) {
      try {
         // 1) verify token

         const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

         // 2) Check if user still exists
         const currentUser = await User.findById(decoded.id);
         console.log(currentUser);
         if (!currentUser) {
            return next();
         }

         // 3) Check if user changed password after the token was issued
         if (changedPasswordAfter(decoded.iat, currentUser)) {
            return next();
         }

         // THERE IS A LOGGED IN USER
         res.locals.user = currentUser;
         return next();
      } catch (err) {
         console.log(err);
         return next();
      }
   }
   next();
};
//////////////////////Protect routes function
exports.protect = catchAsync(async (req, res, next) => {
   try {
      let token;
      //1)Get token and check if exists!
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
         token = req.headers.authorization.split(' ')[1];
      } else if (req.cookies.jwt) {
         token = req.cookies.jwt;
      }

      if (!token) throw new AppError('You are not logged in! Please log in to get access!', 401);
      //2)Validate token/Verification
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
      //3)Check if users still exists
      const freshUser = await User.findById(decoded.id);

      if (!freshUser) throw new AppError('The user no longer exists!', 401);

      //4)Check if user changed password(token) after JWT was issued
      if (changedPasswordAfter(decoded.iat, freshUser))
         throw new AppError('User recently changed password! Please log in again!', 401);

      //Grant access to protected Route
      req.user = freshUser;
      next();
   } catch (err) {
      next(err);
   }
});

//////////////////////Restrict routes function
exports.restrictTo =
   (...roles) =>
   (req, res, next) => {
      if (!roles.includes(req.user.role)) {
         return next(new AppError('You do not have permission to perform this action', 403));
      }
      next();
   };

//////////////////////Forgot password function
exports.forgotPassword = catchAsync(async (req, res, next) => {
   try {
      //1)Get user based on POSTed email
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
         return next(new AppError('User does`t exist! Sign up first!', 404));
      }
      //2)Generate random reset password
      const resetToken = createPasswordResetToken(user);
      user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
      await user.save({ validateBeforeSave: false });

      //3)Send it to users`s email
      const resetURL = `${req.protocol}://${req.get(
         'host'
      )}/api/v1/users/resetPassword/${resetToken}`;
      await sendResetPasswordEmail(user, resetURL);
      res.status(200).json({
         status: 'success',
         message: 'Token sent to email!',
      });
   } catch (err) {
      next(err);
   }
});
exports.logout = (req, res) => {
   res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
   });
   res.status(200).json({ status: 'success' });
};
//////////////////////Reset password function
exports.resetPassword = catchAsync(async (req, res, next) => {
   try {
      //1) Get user based on token
      const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
      const user = await User.findOne({
         passwordResetToken: hashedToken,
         passwordResetExpires: { $gt: Date.now() },
      });
      //2)If token not expired and there is a user set new PASSWORD
      await updateCurrentPassword(user, req.body);
      //3)Log in the user in, send JWT
      const { token } = createSendToken(user);
      res.status(201).json({
         status: 'success',
         token,
         data: {
            user,
         },
      });
   } catch (err) {
      next(err);
   }
});

//////////////////////Update password function
exports.updatePassword = catchAsync(async (req, res, next) => {
   try {
      //1)Get user from collection
      const user = await User.findById(req.user.id).select('+password');
      //2)Check if password is correct //3)If password correct update it
      await checkPasswordOnUpdate(user, req.body);
      //4) Login user, sendJWT
      const { token } = createSendToken(user);
      res.status(201).json({
         status: 'success',
         token,
         data: {
            user,
         },
      });
   } catch (err) {
      next(err);
   }
});

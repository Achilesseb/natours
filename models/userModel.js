const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const { passwordStrength: checkPasswordStrength } = require('check-password-strength');
const AppError = require('../utils/appError');

const userSchema = new mongoose.Schema({
   name: {
      type: String,
      required: [true, 'User must have a name!'],
      unique: true,
      trim: true,
      minlength: [5, 'Username must have at least 5 characters!'],
      maxlength: [50, 'Username must have less or equal to 30 characters'],
   },
   email: {
      type: String,
      required: [true, 'Please provide an email!'],
      unique: true,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email!'],
   },
   role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user',
   },
   photo: String,
   password: {
      type: String,
      required: true,
      minlength: [8, 'Password must have at least 8 characters!'],
      select: false,
   },
   passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password!'],
      validate: {
         validator: function (el) {
            //works just on SAVE/ CREATE!
            return el === this.password;
         },
         message: 'Passwords are not the same!',
      },
   },
   passwordChangedAt: Date,
   passwordResetToken: String,
   passwordResetExpires: Date,
   active: {
      type: Boolean,
      default: true,
      select: false,
   },
   loginAttempts: {
      type: Number,
      default: 0,
   },
   lockUntil: Number,
});

userSchema.virtual('isLocked').get(function () {
   return !!(
      this.lockUntil &&
      new Date(this.lockUntil).toLocaleTimeString() > new Date(Date.now()).toLocaleTimeString()
   );
});
userSchema.pre('save', async function (next) {
   if (!this.isModified('password')) return next();
   if (
      checkPasswordStrength(this.password).value.toUpperCase() ===
      process.env.PASSWORD_CHECK_STRENGTH_MIN
   ) {
      return next(new AppError('Password is too weak! Please use a stronger Password!', 403));
   }
   this.password = await bcrypt.hash(this.password, 12); // 12 tells how much cpu power to use. Higher means better encryption!
   this.passwordConfirm = undefined;
   next();
});

userSchema.pre('save', async function (next) {
   if (!this.isModified('password' || this.isNew)) return next();
   this.passwordChangedAt = Date.now() - 1000;
   next();
});

userSchema.pre(/^find/, function (next) {
   this.find({ active: { $ne: false } });
   next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;

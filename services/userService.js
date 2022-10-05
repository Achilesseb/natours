const crypto = require('crypto');
const bcrypt = require('bcryptjs');

exports.correctPassword = async function (candidatePassword, userPassword) {
   return await bcrypt.compare(candidatePassword, userPassword);
};
exports.changedPasswordAfter = function (JWTTimestamp, user) {
   if (user.passwordChangedAt) {
      const changedTimeStamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
      return changedTimeStamp > JWTTimestamp;
   }
   return false;
   //false means not changed || true=> Changed password- invalid token?
};
exports.createPasswordResetToken = function () {
   const resetToken = crypto.randomBytes(32).toString('hex');
   return resetToken;
};
exports.incrementLoginAttempts = function (user) {
   const lockExpired = !!(
      user.lockUntil &&
      new Date(user.lockUntil).toLocaleTimeString() < new Date(Date.now()).toLocaleTimeString()
   );

   if (lockExpired) {
      return user.update({
         $set: { loginAttempts: 1 },
         $unset: { lockUntil: 1 },
      });
   }

   const updates = { $inc: { loginAttempts: 1 } };
   const needToLock = user.loginAttempts >= process.env.LOGIN_ATTEMPTS && !user.isLocked;

   if (needToLock) {
      updates.$set = {
         lockUntil: Date.now() + process.env.LOGIN_FAILED_ATTEMPTS_INTERVAL * 60 * 1000,
      };
   }

   return user.update(updates).exec();
};

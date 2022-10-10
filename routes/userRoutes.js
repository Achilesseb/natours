const express = require('express');
const {
   signup,
   login,
   logout,
   protect,
   restrictTo,
   forgotPassword,
   resetPassword,
   updatePassword,
} = require('../controllers/authController');

const {
   getAllUsers,
   getSpecificUser,
   addNewUser,
   updateSpecificUser,
   deleteSpecificUser,
   updateMe,
   deleteMe,
   getMe,
   uploadUserPhoto,
   resizeUserPhoto,
} = require('../controllers/userController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router.use(protect); //All routes after this one are protected! Executed secventially.

router.patch('/updatePassword', updatePassword);
router.get('/me', getMe, getSpecificUser);
router.patch('/updateMe', uploadUserPhoto, resizeUserPhoto, updateMe);
router.delete('/deleteMe', deleteMe);

router.use(restrictTo('admin')); //All routes after this are protected && RESTRICTED TO ADMIN!

router.route('/').get(restrictTo('admin'), getAllUsers).post(restrictTo('admin'), addNewUser);
router
   .route('/:id')
   .get(getSpecificUser, restrictTo('admin'))
   .patch(updateSpecificUser, restrictTo('admin'))
   .delete(restrictTo('admin'), deleteSpecificUser);

module.exports = router;

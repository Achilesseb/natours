/* eslint-disable import/no-useless-path-segments */
const express = require('express');
const {
   signup,
   login,
   protect,
   restrictTo,
   forgotPassword,
   resetPassword,
   updatePassword,
} = require('./../controllers/authController');

const {
   getAllUsers,
   getSpecificUser,
   addNewUser,
   updateSpecificUser,
   deleteSpecificUser,
   updateMe,
} = require('./../controllers/userController');

const router = express.Router();
router.post('/signup', signup);
router.post('/login', login);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router.patch('/updatePassword', protect, updatePassword);

router.patch('/updateMe', protect, updateMe);

router
   .route('/')
   .get(protect, restrictTo('admin'), getAllUsers)
   .post(protect, restrictTo('admin'), addNewUser);
router
   .route('/:id')
   .get(getSpecificUser, protect, restrictTo('admin'))
   .patch(updateSpecificUser, protect, restrictTo('admin'))
   .delete(protect, restrictTo('admin'), deleteSpecificUser);

module.exports = router;

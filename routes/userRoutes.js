/* eslint-disable import/no-useless-path-segments */
const express = require('express');
const {
   signup,
   login,
   protect,
   restrictTo,
   forgotPassword,
   resetPassword,
} = require('./../controllers/authController');

const {
   getAllUsers,
   getSpecificUser,
   addNewUser,
   updateSpecificUser,
   deleteSpecificUser,
} = require('./../controllers/userController');

const router = express.Router();
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
router.route('/').get(getAllUsers).post(addNewUser);
router
   .route('/:id')
   .get(getSpecificUser)
   .patch(updateSpecificUser)
   .delete(protect, restrictTo('admin', 'lead-guide'), deleteSpecificUser);

module.exports = router;

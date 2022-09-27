/* eslint-disable import/no-useless-path-segments */
const express = require('express');
const { signup } = require('./../controllers/authController');
const {
  getAllUsers,
  getSpecificUser,
  addNewUser,
  updateSpecificUser,
  deleteSpecificUser,
} = require('./../controllers/userController');

const router = express.Router();
router.post('/signup', signup);
router.route('/').get(getAllUsers).post(addNewUser);
router
  .route('/:id')
  .get(getSpecificUser)
  .patch(updateSpecificUser)
  .delete(deleteSpecificUser);

module.exports = router;

const express = require('express');
const { getAllReview, addNewReview } = require('../controllers/reviewController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

router.route('/').get(getAllReview).post(protect, restrictTo('user'), addNewReview);

module.exports = router;

/* eslint-disable import/no-useless-path-segments */
const express = require('express');
const { addNewReview } = require('../controllers/reviewController');

const {
   getAllTours,
   addNewTour,
   deleteSpecificTour,
   updateSpecificTour,
   getSpecificTour,
   aliasTopTours,
   checkBody,
   getTourStats,
   getMonthlyPlan,
} = require('./../controllers/tourController');

const { protect, restrictTo } = require('./../controllers/authController');

const router = express.Router();
// router.param('id', checkId);

router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
router.route('/').get(protect, getAllTours).post(checkBody, addNewTour);
router
   .route('/:id')
   .get(getSpecificTour)
   .delete(protect, restrictTo('admin', 'lead-guide'), deleteSpecificTour)
   .patch(updateSpecificTour);

router.route('/:tourId/reviews').post(protect, restrictTo('user'), addNewReview);

module.exports = router;

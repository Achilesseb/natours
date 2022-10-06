/* eslint-disable import/no-useless-path-segments */
const express = require('express');
const reviewRouter = require('../routes/reviewRoutes');

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

router.use('/:tourId/reviews', reviewRouter);

router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
router.route('/').get(protect, getAllTours).post(checkBody, addNewTour);
router
   .route('/:id')
   .get(getSpecificTour)
   .delete(protect, restrictTo('admin', 'lead-guide'), deleteSpecificTour)
   .patch(updateSpecificTour);

module.exports = router;

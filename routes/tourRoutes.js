const express = require('express');
const reviewRouter = require('./reviewRoutes');

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
} = require('../controllers/tourController');

const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

router.route('/tour-stats').get(getTourStats);
router
   .route('/monthly-plan/:year')
   .get(protect, restrictTo('admin', 'lead-guide', 'user'), getMonthlyPlan);
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
router
   .route('/')
   .get(getAllTours)
   .post(checkBody, protect, restrictTo('admin', 'lead-guide'), addNewTour);
router
   .route('/:id')
   .get(getSpecificTour)
   .delete(protect, restrictTo('admin', 'lead-guide'), deleteSpecificTour)
   .patch(protect, restrictTo('admin', 'lead-guide'), updateSpecificTour);

module.exports = router;

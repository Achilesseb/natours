const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const {
   getCheckoutSession,
   getAllBookings,
   createBooking,
   getBooking,
   updateBooking,
   deleteBooking,
} = require('../controllers/bookingController');
const router = express.Router({ mergeParams: true }); //by default a router has access only to his own params. With merge we can access params from other router.

router.use(protect);

router.get('/checkout-session/:tourId', getCheckoutSession);

router.use(restrictTo('admin', 'lead-guide'));

router.route('/').get(getAllBookings).post(createBooking);

router.route('/:id').get(getBooking).patch(updateBooking).delete(deleteBooking);

module.exports = router;

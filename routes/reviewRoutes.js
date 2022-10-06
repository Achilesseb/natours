const express = require('express');
const {
   getAllReview,
   addNewReview,
   deleteSpecificReview,
   updateSpecificReview,
   setTourUserIds,
   getSpecificReview,
} = require('../controllers/reviewController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router({ mergeParams: true }); //by default a router has access only to his own params. With merge we can access params from other router.

router.use(protect);

router.route('/').get(getAllReview).post(restrictTo('user'), setTourUserIds, addNewReview);
router
   .route('/:id')
   .delete(deleteSpecificReview)
   .patch(restrictTo('user', 'admin'), updateSpecificReview)
   .get(restrictTo('user', 'admin'), getSpecificReview);
module.exports = router;

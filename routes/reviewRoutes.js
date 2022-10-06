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

router.route('/').get(getAllReview).post(protect, setTourUserIds, restrictTo('user'), addNewReview);
router
   .route('/:id')
   .delete(deleteSpecificReview)
   .patch(updateSpecificReview)
   .get(getSpecificReview);
module.exports = router;

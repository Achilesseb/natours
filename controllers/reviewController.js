const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const ApiFeatures = require('../utils/apiFeatures');

exports.getAllReview = catchAsync(async function (req, res, next) {
   const features = new ApiFeatures(Review.find(), req.query);
   const reviews = await features.query;
   res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
         reviews,
      },
   });
});

exports.addNewReview = catchAsync(async function (req, res, next) {
   const newReview = await Review.create(req.body);
   res.status(201).json({
      status: 'success',
      data: {
         review: newReview,
      },
   });
});
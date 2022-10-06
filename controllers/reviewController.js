const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

exports.setTourUserIds = (req, res, next) => {
   if (!req.body.tour) req.body.tour = req.params.tourId;
   if (!req.body.user) req.body.user = req.user.id;
   next();
};

exports.getAllReview = factory.getAll(Review);
exports.addNewReview = factory.addNewOne(Review);
exports.deleteSpecificReview = factory.deleteOne(Review);
exports.updateSpecificReview = factory.updateOne(Review);
exports.getSpecificReview = factory.getOne(Review);

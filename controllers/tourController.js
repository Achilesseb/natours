/* eslint-disable no-unused-vars */
/* eslint-disable prefer-object-spread */
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.aliasTopTours = (req, res, next) => {
   req.query.limit = '5';
   req.query.sort = '-ratingsAverage,price';
   req.query.fields = 'name, price, ratingsAverage, summary, description';
   next();
};
exports.checkBody = (req, res, next) => {
   if (!req.body.name || !req.body.price) {
      return res.status(404).json({ status: 'fail', message: 'Invalid Body' });
   }
   next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getSpecificTour = factory.getOne(Tour, { path: 'reviews' });
exports.addNewTour = factory.addNewOne(Tour);
exports.updateSpecificTour = factory.updateOne(Tour);
exports.deleteSpecificTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
   const stats = await Tour.aggregate([
      {
         $match: {
            ratingsAverage: { $gte: 4.5 },
         },
      },
      {
         $group: {
            _id: { $toUpper: '$difficulty' },
            num: { $sum: 1 },
            numRatings: { $sum: '$ratingsQuantity' },
            averageRating: { $avg: '$ratingsAverage' },
            averagePrice: { $avg: '$price' },
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' },
         },
      },
      {
         $sort: {
            avgPrice: 1,
         },
      },
   ]);
   res.status(200).json({
      status: 'success',
      data: {
         stats,
      },
   });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
   const year = req.params.year * 1;

   const plan = await Tour.aggregate([
      {
         $unwind: '$startDates',
      },
      {
         $match: {
            startDates: {
               $gte: new Date(`${year}-01-01`),
               $lte: new Date(`${year}-12-31`),
            },
         },
      },
      {
         $group: {
            _id: { $month: '$startDates' },
            numTourStarts: { $sum: 1 },
            tours: { $push: '$name' },
         },
      },
      {
         $addFields: {
            month: '$_id',
         },
      },
      {
         $project: {
            _id: 0,
         },
      },
      {
         $sort: {
            numTourStarts: -1,
         },
      },
      {
         $limit: 12,
      },
   ]);
   res.status(200).json({
      status: 'success',
      results: plan.length,
      data: {
         plan,
      },
   });
});

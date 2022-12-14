const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const ApiFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
   catchAsync(async (req, res, next) => {
      const doc = await Model.findByIdAndDelete(req.params.id);
      if (!doc) return next(new AppError(req.t('no_document_with_id'), 404));
      res.status(204).json({
         status: 'success',
         data: null,
      });
   });

exports.updateOne = (Model) =>
   catchAsync(async (req, res, next) => {
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
         new: true,
         runValidators: true,
      });
      if (!doc) {
         return next(new AppError(`No document found with that ID!`, 404));
      }
      res.status(200).json({
         status: 'success',
         data: {
            data: doc,
         },
      });
   });

exports.addNewOne = (Model) =>
   catchAsync(async (req, res, next) => {
      const newDoc = await Model.create(req.body);
      res.status(201).json({
         status: 'success',
         data: {
            tour: newDoc,
         },
      });
   });

exports.getOne = (Model, populateOptions) =>
   catchAsync(async (req, res, next) => {
      let query = Model.findById(req.params.id);
      if (populateOptions) query = query.populate(populateOptions);
      const doc = await query;
      if (!doc) {
         return next(new AppError(`No document found with that ID!`, 404));
      }
      res.status(200).json({
         status: 'success',
         data: {
            doc,
         },
      });
   });
exports.getAll = (Model) =>
   catchAsync(async (req, res, next) => {
      // Allow nesterd routes and query
      let filter;
      if (req.params.tourId) filter = { tour: req.params.tourId }; //Find review only for a specific tour!
      //
      const features = new ApiFeatures(Model.find(filter), req.query)
         .filter()
         .sort()
         .limitFields()
         .paginate();

      const doc = await features.query; //can use .explain() to see statisc data about the query!!!!

      res.status(200).json({
         status: 'success',
         results: doc.length, //nice to have for user to know how many "doc" we have
         data: {
            doc,
         },
      });
   });

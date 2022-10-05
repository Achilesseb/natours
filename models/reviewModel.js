const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
   {
      text: {
         type: String,
         required: [true, 'Review text cannot be empty'],
      },
      rating: {
         type: Number,
         required: true,
         min: [1, 'Rating must be above 1.0'],
         max: [5, 'Rating must be bellow 5.0'],
      },
      createdAt: {
         type: Date,
         default: Date.now(),
      },
      tour: {
         type: mongoose.Schema.ObjectId,
         ref: 'Tour',
         required: [true, 'Review must belong to a tour!'],
      },
      user: {
         type: mongoose.Schema.ObjectId,
         ref: 'User',
         required: [true, 'Review must belong to a user!'],
      },
   },
   {
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
   }
);

reviewSchema.pre(/^find/, function (next) {
   this.populate({
      path: 'user',
      select: '_id name photo',
   });
   next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

const mongoose = require('mongoose');
const slugify = require('slugify');

const toursSchema = new mongoose.Schema(
   {
      name: {
         type: String,
         required: [true, 'Tour must have a name!'],
         unique: true,
         trim: true,
         maxlength: [40, 'A tour name must have less or equal then 40 characters'],
         minlength: [10, 'A tour name must have more then 10 characters'],
      },
      slug: String,
      duration: {
         type: Number,
         required: [true, 'Tour must have a durations!'],
      },
      maxGroupSize: {
         type: Number,
         required: [true, 'Tour must have a max group size!'],
      },
      difficulty: {
         type: String,
         required: [true, 'Tour must have a difficulty!'],
         enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Tour must have a difficulty!(easy/medium/difficult)',
         },
         default: 'medium',
      },
      ratingsQuantity: {
         type: Number,
         default: 0,
      },
      ratingsAverage: {
         type: Number,
         default: 4.5,
         min: [1, 'Rating must be above 1.0'],
         max: [5, 'Rating must be bellow 5.0'],
      },
      price: {
         type: Number,
         required: [true, 'Tour must have a price!'],
      },
      priceDiscount: {
         type: Number,
         validate: {
            // Only works for new documents! NOT FOR UPDATE!
            validator: function (value) {
               return value < this.price;
            },
            message: 'Discount price ({VALUE}) must be below regular price',
         },
      },
      summary: {
         type: String,
         trim: true,
      },
      description: {
         type: String,
         trim: true,
      },
      imageCover: {
         type: String,
         required: [true, 'Tour must have an imageCover '],
      },
      images: [String],
      createdAt: {
         type: Date,
         default: Date.now(),
      },
      startDates: [Date],
      secretTour: {
         type: Boolean,
         default: false,
      },
      startLocation: {
         type: {
            type: String,
            default: 'Point',
            enum: ['Point'],
         },
         coordinates: [Number],
         address: String,
         description: String,
      },
      locations: [
         {
            type: {
               type: String,
               default: 'Point',
               enum: ['Point'],
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number,
         },
      ],
      guides: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
   },
   {
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
   }
);

toursSchema.virtual('durationWeeks').get(function () {
   return this.duration / 7;
});

toursSchema.pre('save', function (next) {
   this.slug = slugify(this.name, { lower: true });
   next();
});

toursSchema.pre(/^find/, function (next) {
   this.find({ secretTour: { $ne: true } });
   this.start = Date.now();
   next();
}); //find => query middleware
toursSchema.pre(/^find/, function (next) {
   this.populate(
      'guides'
      // select: '-__v -passwordChangedAt',
   );
   next();
});
// toursSchema.pre('save', async function (next) {
//    const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//    this.guides = await Promise.all(guidesPromises);
//    next();
// });

toursSchema.post(/^find/, function (doc, next) {
   console.log(`Query took ${Date.now() - this.start} milliseconds`);
   next();
});

//Aggregation middleware

toursSchema.pre('aggregate', function (next) {
   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
   next();
});
const Tour = mongoose.model('Tour', toursSchema);

module.exports = Tour;

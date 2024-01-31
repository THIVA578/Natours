const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [10, 'A tour name must be greater than the 10 or equal to'],
      maxlength: [40, 'A tour name must less than the 40 or equal to'],
      validate: [validator.isAlpha, 'Tour name can only contains character'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      lowercase: true,
      enum: {
        values: ['easy', 'medium', 'difficulty'],
        message: 'Difficulty is either:easy,medium,difficulty',
      },
    },
    ratingAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Average is must be greater than 1'],
      max: [5, 'Average is must be less than 5'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: Number,
    summery: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//document middleware
tourSchema.virtual('durationWeeks').get(function () {
  let duration = this.duration / 7;
  return duration.toFixed(2);
});

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// query middleware
tourSchema.pre('find', function (next) {
  this.find({ secretTour: { $nin: true } });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

const Tour = require('./../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

exports.gettAllTours = async (req, res) => {
  try {
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;

    res.status(200).json({
      status: 'success',
      length: tours.length,
      data: {
        tours: tours,
      },
    });
  } catch (e) {
    res.status(404).json({
      status: 'fail',
      message: e.message,
    });
  }
};

exports.createTours = async (req, res) => {
  try {
    let addTourData = await Tour.create(req.body);
    console.log(addTourData);
    res.status(201).json({
      status: 'sucess',
      data: {
        tours: addTourData,
      },
    });
  } catch (e) {
    res.status(400).json({
      status: 'fail',
      message: e.message,
    });
  }
};

exports.getTours = async (req, res) => {
  try {
    let tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: 'Success',
      data: {
        tour,
      },
    });
  } catch (e) {
    res.status(404).json({
      status: 'fail',
      message: 'Tour with id is not there please check the id',
    });
  }
};

exports.updateTours = async (req, res) => {
  try {
    let UpdatedTourData = await Tour.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(200).json({
      status: 'Success',
      data: {
        tours: UpdatedTourData,
      },
    });
  } catch (e) {
    res.status(400).json({
      status: 'fail',
      message: e.message,
    });
  }
};

exports.deleteTours = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: 'Success',
      message: 'Data removed successfully',
    });
  } catch (e) {
    res.status(404).json({
      status: 'fail',
      message: e.message,
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: '$difficulty',
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingAverage' },
          avgRating: { $avg: '$ratingAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);
    res.status(200).json({
      status: 'Success',
      length: stats.length,
      data: stats,
      message: 'Data Fetched successfully',
    });
  } catch (e) {
    res.status(404).json({
      status: 'fail',
      message: e.message,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $addFields: {
          startYear: { $year: '$startDates' },
          startMonth: { $month: '$startDates' },
        },
      },
      {
        $match: {
          startYear: { $eq: year },
        },
      },
      {
        $project: {
          _id: 0,
          startYear: 0,
          startMonth: 0,
        },
      },
    ]);
    res.status(200).json({
      status: 'Success',
      length: plan.length,
      data: plan,
      message: 'Data Fetched successfully',
    });
  } catch (e) {
    res.status(404).json({
      status: 'fail',
      message: e.message,
    });
  }
};

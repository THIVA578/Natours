const Users = require('../models/userModel');

exports.gettAllUsers = async (req, res) => {
  try {
    let allUsers = await Users.find({}, { __v: 0, refreshToken: 0 });
    res.status(200).json({
      status: 'success',
      data: {
        users: allUsers,
      },
    });
  } catch (e) {
    res.status(400).json({
      status: 'fail',
      message: e.message,
    });
  }
};

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'errror',
    message: 'This route is not yet defined',
  });
};

exports.createUsers = (req, res) => {
  res.status(500).json({
    status: 'errror',
    message: 'This route is not yet defined',
  });
};

exports.updateUser = async (req, res, next) => {
  try {
    let updateUsers = await Users.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      message: 'The user is successfully updated',
      data: {
        users: updateUsers,
      },
    });
  } catch (e) {
    const err = new Error(e.message);
    next(err);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await Users.findByIdAndDelete(req.params.id);
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

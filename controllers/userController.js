const fs = require('node:fs');
const userData = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/users.json`)
);

exports.gettAllUsers = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      users: userData,
    },
  });
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

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'errror',
    message: 'This route is not yet defined',
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'errror',
    message: 'This route is not yet defined',
  });
};

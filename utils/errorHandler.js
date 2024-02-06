const errorHandler = (err, req, res, next) => {
  let statusCode = err.status || 500; // Assign a default value
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401; // Modify status code for duplicate entry
    return res.status(statusCode).json({
      status: 'fail',
      message: 'You are unathorized',
    });
  } else {
    console.log(err);
    res.status(statusCode).json({
      status: 'fail',
      name: err.name,
      message: err.message,
    });
  }
};

module.exports = errorHandler;

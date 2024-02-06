const express = require('express');
const app = express();
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const errorHandler = require('./utils/errorHandler');
const errorController = require('./controllers/errorController');

app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.timestamp = new Date().toISOString();
  next();
});

//simple get api

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//unHandled Routes

app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `your accessing ${req.originalUrl} which is not defined`,
  });
  // next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});
app.use(errorHandler);

// error handling Middleware

// app.use(errorController);

module.exports = app;

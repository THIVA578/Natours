const Users = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { promisify } = require('util');
const User = require('../models/userModel');
const sendEmail = require('.././email');
const crypto = require('crypto');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signUp = async (req, res, next) => {
  try {
    // const newUsers = await Users.create(req.body);
    const newUser = await Users.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      role: req.body.role,
    });

    const token = signToken(newUser._id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        users: newUser,
      },
    });
  } catch (e) {
    // let err = new Error(e.message);
    // err.status = 400;
    next(e);
  }
};

exports.login = async (req, res, next) => {
  const { email, password, grandType, refreshToken } = req.body;

  // 1) check if email and grandType exist
  if (!email || !grandType) {
    const error = new Error('Please provide all required details');
    error.status = 400;
    return next(error);
  }

  //  2) check the grandType value
  if (grandType !== 'password' && grandType !== 'refresh') {
    const error = new Error('Incorrect grandType');
    error.status = 401;
    return next(error);
  }

  // 3) need to check password only for grandtype==="password"
  if (grandType === 'password' && !password) {
    const error = new Error('please provide password');
    error.status = 401;
    return next(error);
  }

  // 4) check if user exist && password id correct
  const user = await Users.findOne({ email }).select('+password');

  if (grandType === 'password') {
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new Error('Incorrect email or password', 401));
    }
  }

  // 5) generate custom random string for token
  const generateRandomRefreshToken = require('crypto')
    .randomBytes(64)
    .toString('hex');

  // 6) if passord is verfied and gt is password send token
  if (grandType === 'password') {
    const assignUserToken = await Users.updateOne(
      { _id: user._id },
      { $set: { refreshToken: generateRandomRefreshToken } }
    );
    const token = signToken(user._id);

    res.status(200).json({
      status: 'success',
      accesstoken: token,
      refreshtoken: generateRandomRefreshToken,
    });
  }
  //  7) if gt is refresh
  else {
    // 8) check if refreshtoken is there
    if (!refreshToken) {
      const error = new Error('need refresh token to generate accesstoken');
      error.status = 401;
      return next(error);
    }

    // 9) verfify the refresh token with db
    const checkUser = await User.findById(user._id);
    if (refreshToken !== checkUser.refreshToken) {
      const error = new Error('Invalid refresh token');
      error.status = 401;
      return next(error);
    }

    // 10) then send the token new token and update refresh token in db
    else {
      const token = signToken(user._id);

      const assignUserToken = await Users.updateOne(
        { _id: user._id },
        { $set: { refreshToken: generateRandomRefreshToken } }
      );

      res.status(200).json({
        status: 'success',
        accesstoken: token,
        refreshtoken: generateRandomRefreshToken,
      });
    }
  }
};

exports.protect = async (req, res, next) => {
  // 1) getting token and check it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    const error = new Error('You are unathorized');
    error.status = 401;
    return next(error);
  }

  // 2) Verification token
  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_KEY);
    // 3) check if user still exists
    const checkUser = await Users.findById(decoded.id);
    if (!checkUser) {
      const error = new Error(
        'You are account is not exist in our application unathorized'
      );
      error.status = 401;
      error.name = 'Invalid Token';
      return next(error);
    } else {
      req.user = checkUser;
      return next();
    }
  } catch (e) {
    next(e);
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      const error = new Error();
      error.status = 403;
      error.name = 'Your dont have the permission to do the operation ';
      return next(error);
    }
    next();
  };
};

exports.forgotPassword = async (req, res, next) => {
  // 1) get user based on posted email
  const userData = await User.findOne({ email: req.body.email });
  if (!userData) {
    const error = new Error();
    error.status = 400;
    error.message = "can't able to find users";
    next(error);
  }

  // 2) generate the random reset token
  const resetToken = userData.createPasswordResetToken();
  await userData.save({ validateBeforeSave: false });

  // 3)send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and
  passwordConfirm to: ${resetURL}.\n If you didn't want to forget your password, please ignore this
  email!`;
  try {
    await sendEmail({
      email: userData.email,
      subject: 'Your password reset token (valid for 10min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token is sent to email',
    });
  } catch (err) {
    userData.passwordResetToken = undefined;
    userData.passwordResetExpires = undefined;
    await userData.save({ validateBeforeSave: false });

    const error = new Error("can't able send the mail for password reset");
    error.status = 500;
    return next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    // 1) Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    // 2) if token has not expired and there is user, set the new password
    console.log(user);
    if (!user) {
      const err = new Error('Token is incorrect or token is expired');
      err.status = 400;
      return next(err);
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    user.refreshToken = undefined;
    await user.save();
    // 3) update changedpassword property for the user
    // 4) Log the user in,send JWT
    const generateRandomRefreshToken = require('crypto')
      .randomBytes(64)
      .toString('hex');
    const token = signToken(user._id);

    res.status(200).json({
      status: 'success',
      message: 'Password is reset successfully',
      accesstoken: token,
      refreshtoken: generateRandomRefreshToken,
    });
  } catch (e) {
    res.status(500).json({
      status: 'failed',
      message: e.message,
    });
  }
};

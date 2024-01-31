const express = require('express');
const router = express.Router();
const userController = require('./../controllers/userController');

router
  .route('/')
  .get(userController.gettAllUsers)
  .post(userController.createUsers);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;

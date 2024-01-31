const express = require('express');
const router = express.Router();
const tourController = require('./../controllers/tourController');

router
  .route('/')
  .get(tourController.gettAllTours)
  .post(tourController.createTours);

router.route('/get-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/:id')
  .get(tourController.getTours)
  .patch(tourController.updateTours)
  .delete(tourController.deleteTours);

module.exports = router;

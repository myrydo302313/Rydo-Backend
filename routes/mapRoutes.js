const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth-middleware.js');
const mapController = require('../controllers/mapController');
const { query } = require('express-validator');

router.get('/get-coordinates',
    query('address').isString().isLength({ min: 3 }),
    authMiddleware,
    mapController.getCoordinates
);

router.get('/get-distance-time',
    query('origin').isString().isLength({ min: 3 }),
    query('destination').isString().isLength({ min: 3 }),
    authMiddleware,
    mapController.getDistanceTime
)

router.get('/get-suggestions',
    query('input').isString().isLength({ min: 3 }),
    authMiddleware,
    mapController.getAutoCompleteSuggestions
)

// router.get('/get-current-location',
//     query('input').isString().isLength({ min: 3 }),
//     authMiddleware,
//     mapController.getCurrentLocation
// )

router.get(
    "/get-current-location",
    [
      query("lat").isFloat().withMessage("Latitude must be a number"),
      query("lng").isFloat().withMessage("Longitude must be a number"),
    ],
    authMiddleware,
    mapController.getCurrentLocation
  );

module.exports = router;
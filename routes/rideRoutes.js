const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { body, query } = require("express-validator");
const rideController = require("../controllers/rideController");
const authMiddleware = require("../middlewares/auth-middleware");

router.post(
  "/create",
  authMiddleware,
  body("pickup")
    .isString()
    .isLength({ min: 3 })
    .withMessage("Invalid pickup address"),
  body("destination")
    .isString()
    .isLength({ min: 3 })
    .withMessage("Invalid destination address"),
  body("vehicleType")
    .isString()
    .isIn(["auto", "car", "moto"])
    .withMessage("Invalid vehicle type"),
  rideController.createRide
);

router.post("/cancelRide", authMiddleware, rideController.cancelRide);

router.get(
  "/get-fare",
  authMiddleware,
  query("pickup")
    .isString()
    .isLength({ min: 3 })
    .withMessage("Invalid pickup address"),
  query("destination")
    .isString()
    .isLength({ min: 3 })
    .withMessage("Invalid destination address"),
  rideController.getFare
);

router.post(
  "/confirm",
  // authMiddleware,
  body("rideId").isMongoId().withMessage("Invalid ride id"),
  rideController.confirmRide
);

router.get(
  "/start-ride",
  authMiddleware,
  query("rideId").isMongoId().withMessage("Invalid ride id"),
  query("otp")
    .isString()
    .isLength({ min: 6, max: 6 })
    .withMessage("Invalid OTP"),
  rideController.startRide
);

router.get("/pending-rides", rideController.getPendingRidesForCaptain);

router.post("/end-ride", authMiddleware, rideController.endRide);

router.get("/is-ride-accepted/:rideId", rideController.isRideAccepted);

module.exports = router;

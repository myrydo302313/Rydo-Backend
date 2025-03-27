const rideService = require("../services/ride.service");
const { validationResult } = require("express-validator");
const mapService = require("../services/maps.service");
const { sendMessageToSocketId } = require("../socket");
const rideModel = require("../models/ride-model");
const userModel = require("../models/user-model");
const Captain = require("../models/captain-model");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const admin = require("firebase-admin");
require("dotenv").config();
const {
  getCaptainsFcmTokens,
  sendPushNotification,
} = require("../services/notificationServices");

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_CREDENTIALS, "base64").toString("utf-8")
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports.createRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { pickup, destination, vehicleType } = req.body;

  try {
    // Call the ride service and get the populated ride
    const rideWithUser = await rideService.createRide({
      user: req.userID,
      pickup,
      destination,
      vehicleType,
    });

    // Send response to the user first
    res.status(201).json(rideWithUser);

    // Get pickup coordinates
    const pickupCoordinates = await mapService.getAddressCoordinate(pickup);

    // Find available captains in the radius (2km)
    const captainsInRadius = await mapService.getCaptainsInTheRadius(
      pickupCoordinates.ltd,
      pickupCoordinates.lng,
      2
    );

    console.log("Captains in Radius:", captainsInRadius);

    // Notify captains via WebSocket
    captainsInRadius.forEach((captain) => {
      sendMessageToSocketId(captain.socketId, {
        event: "new-ride",
        data: rideWithUser,
      });
    });

    // 🔥 Fetch FCM Tokens of Nearby Captains
    const captainIds = captainsInRadius.map((c) => c._id);
    const fcmTokens = await getCaptainsFcmTokens(captainIds);

    console.log("🚀 Sending FCM Notifications to Captains:", fcmTokens);

    // 🔥 Send FCM Push Notification
    if (fcmTokens.length > 0) {
      const payload = {
        data: {
          title: "🚖 New Ride Available!",
          body: `Pickup: ${pickup}, Destination: ${destination}`,
          rideId: String(rideWithUser._id), // ✅ Ensure it's a string
          pickup: String(pickup),
          destination: String(destination),
          vehicleType: String(vehicleType),
          icon: "/images/rydoLogo3.png", // ✅ Add icon in data
          sound: "default",
        },
      };

      // Send the notification
      await sendPushNotification(
        fcmTokens,
        payload.data.title,
        payload.data.body,
        payload.data.icon,
        payload.data
      );
    }
  } catch (err) {
    console.error("Error creating ride:", err);
    if (!res.headersSent) {
      return res.status(500).json({ message: err.message });
    }
  }
};

module.exports.cancelRide = async (req, res) => {
  const { rideId } = req.body;

  try {
    // Find the ride with user details
    const ride = await rideModel.findById(rideId).populate("user");

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    // Update the ride status to "cancelled"
    ride.status = "cancelled";
    await ride.save();

    // Send a socket message to the user about the cancellation
    if (ride.user && ride.user.socketId) {
      sendMessageToSocketId(ride.user.socketId, {
        event: "ride-cancelled",
        data: {
          rideId,
          message: "Your ride has been cancelled by the captain",
        },
      });
    }

    return res.status(200).json({ message: "Ride cancelled successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports.cancelRideUser = async (req, res) => {
  const { rideId } = req.body;

  try {
    // Find the ride with user details
    const ride = await rideModel
      .findById(rideId)
      .populate("user")
      .populate("captain");

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    // Update the ride status to "cancelled"
    ride.status = "cancelled";
    await ride.save();

    // Send a socket message to the user about the cancellation
    if (ride.captain && ride.captain.socketId) {
      sendMessageToSocketId(ride.captain.socketId, {
        event: "ride-cancelled",
        data: {
          rideId,
          message: "The ride has been cancelled by the user",
        },
      });
    }

    return res.status(200).json({ message: "Ride cancelled successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports.getPendingRidesForCaptain = async (req, res) => {
  try {
    const captainId = req.query.captainId;

    if (!captainId) {
      return res.status(400).json({ message: "Captain ID is required" });
    }

    // 1️⃣ Find the Captain
    const captain = await Captain.findById(captainId);
    if (!captain || !captain.location) {
      return res.status(404).json({ message: "Captain location not found" });
    }

    const { ltd, lng } = captain.location;

    // 2️⃣ Find Pending Rides Within 2 km
    const pendingRides = await rideModel
      .find({
        status: "pending",
        "pickupLocation.latitude": {
          $gte: ltd - 0.018,
          $lte: ltd + 0.018,
        },
        "pickupLocation.longitude": {
          $gte: lng - 0.018,
          $lte: lng + 0.018,
        },
      })
      .populate("user", "name phone");

    return res.status(200).json(pendingRides);
  } catch (error) {
    console.error("Error fetching pending rides:", error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports.getFare = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { pickup, destination } = req.query;

  try {
    const fare = await rideService.getFare(pickup, destination);
    return res.status(200).json(fare);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.confirmRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId, captainId } = req.body;

  try {
    const ride = await rideService.confirmRide({ rideId, captainId });

    sendMessageToSocketId(ride.user.socketId, {
      event: "ride-confirmed",
      data: ride,
    });

    return res.status(200).json(ride);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports.startRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId, otp } = req.query;

  console.log(rideId, otp);

  try {
    const ride = await rideService.startRide({
      rideId,
      otp,
      captain: req.user,
    });

    console.log(ride);

    sendMessageToSocketId(ride.user.socketId, {
      event: "ride-started",
      data: ride,
    });

    return res.status(200).json(ride);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.endRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId } = req.body;

  try {
    const ride = await rideService.endRide({ rideId, captain: req.user });

    sendMessageToSocketId(ride.user.socketId, {
      event: "ride-ended",
      data: ride,
    });

    return res.status(200).json(ride);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.isRideAccepted = async (req, res) => {
  try {
    const { rideId } = req.params; // Extract rideId correctly
    const ride = await rideModel.findOne({ _id: rideId });

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    res.json({ isAccepted: ride.status === "accepted" }); // Send response as JSON
  } catch (error) {
    console.error("Error in isRideAccepted:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

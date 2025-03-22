const express = require("express");
const router = express.Router();
const Captain = require("../models/captain-model");

// Save FCM token
router.post("/save-token", async (req, res) => {
  try {
    const { token, driverId } = req.body;

    console.log("📩 Received Token:", token);
    console.log("📩 Received Driver ID:", driverId);

    if (!token || !driverId) {
      return res.status(400).json({ message: "Token and driverId are required" });
    }

    // Save or update the token in the database
    await Captain.findByIdAndUpdate(driverId, { fcmToken: token }, { upsert: true });

    res.status(200).json({ message: "Token saved successfully" });
  } catch (error) {
    console.error("Error saving token:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;

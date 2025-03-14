const Ride = require("../models/ride-model.js");
const Captain = require("../models/captain-model.js");
const User = require("../models/user-model.js");

module.exports.acceptedRides = async (req, res) => {
  try {
    const userId = req.userID; // Assuming user's ID is retrieved from `req.userID`

    const latestRide = await Ride.findOne({
      user: userId,
      status: { $in: ["accepted", "ongoing"] }, // Match either "accepted" or "ongoing"
    })
      .sort({ createdAt: -1 }) // Sort in descending order to get the latest ride
      .limit(1)
      .populate("captain")
      .populate("user")
      .select("+otp"); // Explicitly include the OTP field

    if (!latestRide) {
      return res.status(404).json({ message: "No accepted rides found" });
    }

    res.status(200).json({ ride: latestRide });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const Captain = require("../models/captain-model.js");
const User = require("../models/user-model.js");
const Ride = require("../models/ride-model.js");

module.exports.totalUsers = async (req, res) => {
  try {
    // Fetch the total number of users
    const userCount = await User.countDocuments();

    // Send the count as a response
    return res.status(200).json({ totalUsers: userCount });
  } catch (error) {
    console.error("Error fetching total users:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
module.exports.totalCaptains = async (req, res) => {
  try {
    // Fetch the total number of users
    const captainCount = await Captain.countDocuments();

    // Send the count as a response
    return res.status(200).json({ totalCaptains: captainCount });
  } catch (error) {
    console.error("Error fetching total captain:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
module.exports.totalRides = async (req, res) => {
  try {
    // Fetch the total number of users
    const rideCount = await Ride.countDocuments();

    // Send the count as a response
    return res.status(200).json({ totalRides: rideCount });
  } catch (error) {
    console.error("Error fetching total rides:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.getUsers = async (req, res) => {
  try {
    // Fetch the total number of users
    const users = await User.find();

    // Send the count as a response
    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


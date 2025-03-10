const Ride = require("../models/ride-model.js");
const Captain = require("../models/captain-model.js");

module.exports.availableRides = async (req, res, next) => {
  try {
    const captainId = req.userID;

    // 1️⃣ Find the Captain's Location
    const captain = await Captain.findById(captainId);
    if (!captain || !captain.location) {
      return res.status(404).json({ message: "Captain location not found" });
    }

    const { ltd: captainLat, lng: captainLng } = captain.location;

    // 2️⃣ Fetch all pending rides
    const pendingRides = await Ride.find({ status: "pending" });

    // 3️⃣ Filter rides based on distance (within 2km)
    const nearbyRides = pendingRides.filter((ride) => {
      if (!ride.pickupLocation) return false;

      const { ltd: pickupLat, lng: pickupLng } = ride.pickupLocation;

      // Calculate distance using Haversine formula
      const distance = getDistanceFromLatLonInKm(
        captainLat,
        captainLng,
        pickupLat,
        pickupLng
      );

      return distance <= 2; // Keep rides within 2 km
    });

    return res.status(200).json(nearbyRides);
  } catch (error) {
    console.error("Error fetching pending rides:", error);
    return res.status(500).json({ message: error.message });
  }
};

// 📌 Haversine formula to calculate distance between two coordinates
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

// Convert degrees to radians
function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

module.exports.cancelledRides = async (req, res, next) => {
  try {
    const captainId = req.userID;

    const cancelledRides = await Ride.find({
      captain: captainId,
      status: "cancelled",
    });

    res.status(200).json(cancelledRides);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.completedRides = async (req, res, next) => {
  try {
    const captainId = req.userID;

    const completedRides = await Ride.find({
      captain: captainId,
      status: "completed",
    });

    res.status(200).json(completedRides);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

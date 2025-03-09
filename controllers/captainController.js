const Ride=require('../models/ride-model.js')

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

const Ride = require("../models/ride-model.js");
const Captain = require("../models/captain-model.js");

module.exports.availableRides = async (req, res, next) => {
  try {
    const captainId = req.userID;

    // Find the Captain
    const captain = await Captain.findById(captainId);
    if (
      !captain ||
      !captain.location ||
      captain.location.ltd === undefined ||
      captain.location.lng === undefined
    ) {
      return res.status(404).json({ message: "Captain location not found" });
    }

    const { ltd, lng } = captain.location;

    // Convert degrees to radians for MongoDB query
    const earthRadius = 6378.1; // Earth's radius in km
    const maxDistanceKm = 2; // 2 km radius

    // Find rides within 2 km
    const pendingRides = await Ride.aggregate([
      {
        $addFields: {
          distance: {
            $multiply: [
              earthRadius,
              {
                $acos: {
                  $add: [
                    {
                      $multiply: [
                        {
                          $sin: {
                            $degreesToRadians: "$pickupLocation.latitude",
                          },
                        },
                        { $sin: { $degreesToRadians: ltd } },
                      ],
                    },
                    {
                      $multiply: [
                        {
                          $cos: {
                            $degreesToRadians: "$pickupLocation.latitude",
                          },
                        },
                        { $cos: { $degreesToRadians: ltd } },
                        {
                          $cos: {
                            $subtract: [
                              {
                                $degreesToRadians: "$pickupLocation.longitude",
                              },
                              { $degreesToRadians: lng },
                            ],
                          },
                        },
                      ],
                    },
                  ],
                },
              },
            ],
          },
        },
      },
      {
        $match: {
          status: "pending",
          distance: { $lte: maxDistanceKm },
        },
      },
    ]);

    return res.status(200).json(pendingRides);
  } catch (error) {
    console.error("Error fetching pending rides:", error);
    return res.status(500).json({ message: error.message });
  }
};

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

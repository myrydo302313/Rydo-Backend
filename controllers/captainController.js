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

    const { ltd, lng } = captain.location; // Captain's location

    const earthRadius = 6378.1; // Earth's radius in km
    const maxDistanceKm = 2; // 2 km radius

    // Get timestamp for 5 minutes ago
    const fiveMinutesAgo = new Date();
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

    // Find rides within 2 km of the captain and created in the last 5 minutes
    const pendingRides = await Ride.aggregate([
      {
        $addFields: {
          captainDistance: {
            $multiply: [
              earthRadius,
              {
                $acos: {
                  $max: [
                    -1,
                    {
                      $min: [
                        {
                          $add: [
                            {
                              $multiply: [
                                {
                                  $sin: {
                                    $degreesToRadians:
                                      "$pickupLocation.latitude",
                                  },
                                },
                                { $sin: { $degreesToRadians: ltd } },
                              ],
                            },
                            {
                              $multiply: [
                                {
                                  $cos: {
                                    $degreesToRadians:
                                      "$pickupLocation.latitude",
                                  },
                                },
                                { $cos: { $degreesToRadians: ltd } },
                                {
                                  $cos: {
                                    $subtract: [
                                      {
                                        $degreesToRadians:
                                          "$pickupLocation.longitude",
                                      },
                                      { $degreesToRadians: lng },
                                    ],
                                  },
                                },
                              ],
                            },
                          ],
                        },
                        1, // Ensure acos() input is in range [-1,1]
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
          captainDistance: { $lte: maxDistanceKm }, // Filter rides within 2 km of captain
          createdAt: { $gte: fiveMinutesAgo }, // Filter rides created in the last 5 mins
        },
      },
      // Populate user using $lookup
      {
        $lookup: {
          from: "users", // Name of the user collection
          localField: "user",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails", // Convert array into an object (optional)
      },
      {
        $addFields: {
          user: "$userDetails",
        },
      },
      {
        $project: {
          userDetails: 0, // Remove the userDetails field
        },
      },
    ]);

    console.log("Pending Rides:", pendingRides);

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
    }).populate('user');

    res.status(200).json(cancelledRides);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.completedRides = async (req, res, next) => {
  try {
    const captainId = req.userID;
    console.log(captainId)
    const completedRides = await Ride.find({
      captain: captainId,
      status: "completed",
    }).populate('user')

    console.log('completed rides ye rha',completedRides)

    res.status(200).json(completedRides);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.totalEarnings = async (req, res, next) => {
  try {
    const captainId = req.userID;
    console.log("Captain ID:", captainId);

    // Find all completed rides of the captain
    const completedRides = await Ride.find({
      captain: captainId,
      status: "completed",
    });

    const totalEarnings = completedRides.reduce((sum, ride) => sum + (ride.fare || 0), 0);

    console.log("Total Earnings:", totalEarnings);

    res.status(200).json({ totalEarnings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.totalCommission = async (req, res, next) => {
  try {
    const captainId = req.userID;
    console.log("Captain ID:", captainId);

    // Find all completed rides of the captain
    const completedRides = await Ride.find({
      captain: captainId,
      status: "completed",
    });

    const totalEarnings = completedRides.reduce((sum, ride) => sum + (ride.fare || 0), 0);

    console.log("Total Earnings:", totalEarnings);

    totalCommission=Math.ceil(totalEarnings*0.12);
    res.status(200).json({ totalCommission });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.completedRidesCount = async (req, res) => {
  try {
    const captainId = req.userID; 
    
    const completedRidesCount = await Ride.countDocuments({
      captain: captainId,
      status: "completed",
    });

    res.status(200).json({ completedRidesCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.totalDistance = async (req, res) => {
  try {
    const captainId = req.userID; // Assuming captain's ID is retrieved from `req.userID`
    
    const totalDistance = await Ride.aggregate([
      { $match: { captain: captainId, status: "completed" } }, // Filter completed rides
      { $group: { _id: null, totalDistance: { $sum: "$distance" } } } // Sum up the distance field
    ]);

    res.status(200).json({ totalDistance: totalDistance[0]?.totalDistance || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

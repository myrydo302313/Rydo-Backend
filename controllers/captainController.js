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
    console.log('ye check horha')
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
const captainModel = require("../models/captain-model");

module.exports.getAddressCoordinate = async (address) => {
  const apiKey = process.env.GOOGLE_MAPS_API;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK") {
      const location = data.results[0].geometry.location;
      return {
        ltd: location.lat,
        lng: location.lng,
      };
    } else {
      throw new Error("Unable to fetch coordinates");
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports.getDistanceTime = async (origin, destination) => {
  if (!origin || !destination) {
    throw new Error("Origin and destination are required");
  }

  const apiKey = process.env.GOOGLE_MAPS_API;
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
    origin
  )}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK") {
      if (data.rows[0].elements[0].status === "ZERO_RESULTS") {
        throw new Error("No routes found");
      }

      return data.rows[0].elements[0];
    } else {
      throw new Error("Unable to fetch distance and time");
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
};

module.exports.getAutoCompleteSuggestions = async (input) => {
  if (!input) {
    throw new Error("Query is required");
  }

  const apiKey = process.env.GOOGLE_MAPS_API;
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    input
  )}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK") {
      return data.predictions
        .map((prediction) => prediction.description)
        .filter((value) => value);
    } else {
      throw new Error("Unable to fetch suggestions");
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
};

module.exports.getCurrentLocation = async (lat, lng) => {
  if (!lat || !lng) {
    throw new Error("Latitude and Longitude are required!");
  }

  const apiKey = process.env.GOOGLE_MAPS_API;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK") {
      return data.results[0]?.formatted_address || "Location not found";
    } else {
      throw new Error(`Google API Error: ${data.status}`);
    }
  } catch (err) {
    console.error("Google API Fetch Error:", err);
    throw err;
  }
};

module.exports.getCaptainsInTheRadius = async (lat, lng, radius) => {
  try {
    console.log("Finding captains near:", lat, lng, "within radius:", radius);

    const earthRadius = 6371; // Earth's radius in km

    const captains = await captainModel.aggregate([
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
                          $sin: { $degreesToRadians: "$location.lat" },
                        },
                        { $sin: { $degreesToRadians: lat } },
                      ],
                    },
                    {
                      $multiply: [
                        {
                          $cos: { $degreesToRadians: "$location.lat" },
                        },
                        { $cos: { $degreesToRadians: lat } },
                        {
                          $cos: {
                            $subtract: [
                              { $degreesToRadians: "$location.lng" },
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
          distance: { $lte: radius }, // Only keep captains within the given radius
        },
      },
    ]);

    console.log("Captains Found:", captains);
    return captains;
  } catch (error) {
    console.error("Error fetching captains:", error);
    return [];
  }
};

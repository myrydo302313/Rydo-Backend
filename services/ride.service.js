const rideModel = require("../models/ride-model");
const captainModel = require("../models/captain-model");
const mapService = require("./maps.service");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

async function getFare(pickup, destination) {
  if (!pickup || !destination) {
    throw new Error("Pickup and destination are required");
  }

  const distanceTime = await mapService.getDistanceTime(pickup, destination);

  const baseFare = {
    auto: 10,
    car: 20,
    moto: 7,
  };

  const perKmRate = {
    auto: 25,
    car: 40,
    moto: 15,
  };

  // const perMinuteRate = {
  //   auto: 2,
  //   car: 3,
  //   moto: 1.5,
  // };

  const fare = {
    auto: Math.round(
      baseFare.auto + (distanceTime.distance.value / 1000) * perKmRate.auto
    ),
    car: Math.round(
      baseFare.car + (distanceTime.distance.value / 1000) * perKmRate.car
    ),
    moto: Math.round(
      baseFare.moto + (distanceTime.distance.value / 1000) * perKmRate.moto
    ),
  };

  return fare;
}

module.exports.getFare = getFare;

function getOtp(num) {
  function generateOtp(num) {
    const otp = crypto
      .randomInt(Math.pow(10, num - 1), Math.pow(10, num))
      .toString();
    return otp;
  }
  return generateOtp(num);
}

module.exports.createRide = async ({
  user,
  pickup,
  destination,
  vehicleType,
}) => {
  if (!user || !pickup || !destination || !vehicleType) {
    throw new Error("All fields are required");
  }

  const pickupCoordinates = await mapService.getAddressCoordinate(pickup);
  const destinationCoordinates = await mapService.getAddressCoordinate(
    destination
  );

  if (!pickupCoordinates || !destinationCoordinates) {
    throw new Error("Invalid address. Unable to fetch coordinates.");
  }

  const distanceTime = await mapService.getDistanceTime(pickup, destination);

  const fare = await getFare(pickup, destination);

  console.log("distance aya", distanceTime.distance.value);

  const ride = await rideModel.create({
    user,
    pickup,
    pickupLocation: {
      latitude: pickupCoordinates.ltd,
      longitude: pickupCoordinates.lng,
    },
    destination,
    destinationLocation: {
      latitude: destinationCoordinates.ltd,
      longitude: destinationCoordinates.lng,
    },
    otp: getOtp(6),
    fare: fare[vehicleType],
    distance: (distanceTime.distance.value / 1000).toFixed(2),
  });

  // Populate the user directly after creation
  const populatedRide = await ride.populate("user");
  return populatedRide;
};

module.exports.confirmRide = async ({ rideId, captainId }) => {
  if (!rideId) {
    throw new Error("Ride id is required");
  }

  await rideModel.findOneAndUpdate(
    { _id: rideId },
    { status: "accepted", captain: captainId },
    { new: true }
  );

  const ride = await rideModel
    .findOne({
      _id: rideId,
    })
    .populate("user")
    .populate("captain")
    .select("+otp");

  if (!ride) {
    throw new Error("Ride not found");
  }

  return ride;
};

module.exports.startRide = async ({ rideId, otp, captain }) => {
  if (!rideId || !otp) {
    throw new Error("Ride id and OTP are required");
  }

  const ride = await rideModel
    .findOne({
      _id: rideId,
    })
    .populate("user")
    .populate("captain")
    .select("+otp");

  if (!ride) {
    throw new Error("Ride not found");
  }

  if (ride.status !== "accepted") {
    throw new Error("Ride not accepted");
  }

  if (ride.otp !== otp) {
    throw new Error("Invalid OTP");
  }

  await rideModel.findOneAndUpdate(
    {
      _id: rideId,
    },
    {
      status: "ongoing",
    }
  );

  return ride;
};

module.exports.endRide = async ({ rideId, captain }) => {
  if (!rideId) {
    throw new Error("Ride id is required");
  }

  const ride = await rideModel.findOne({
    _id: rideId,
    captain: captain._id,
  })
    .populate("user")
    .populate("captain")
    .select("+otp");


  if (!ride) {
    throw new Error("Ride not found");
  }

  if (ride.status !== "ongoing") {
    throw new Error("Ride not ongoing");
  }

  // Calculate commission (12% of fare)
  const commission = parseInt(Math.ceil(0.12 * ride.fare), 10);

  // Update the ride status to 'completed'
  await rideModel.findOneAndUpdate({ _id: rideId }, { status: "completed" });

  // Update the captain's commission in the Captain model
  await captainModel.findOneAndUpdate(
    { _id: captain._id },
    { $inc: { commission: commission } }, // Increment existing commission
    { new: true }
  );

  return ride;
};

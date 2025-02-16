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
    auto: 5,
    car: 5,
    moto: 5,
  };

  const perKmRate = {
    auto: 3.13,
    car: 6,
    moto: 2.45,
  };

  const perMinuteRate = {
    auto: 2,
    car: 3,
    moto: 1.5,
  };

  const fare = {
    auto: Math.round(
      baseFare.auto +
        (distanceTime.distance.value / 1000) * perKmRate.auto +
        (distanceTime.duration.value / 60) * perMinuteRate.auto
    ),
    car: Math.round(
      baseFare.car +
        (distanceTime.distance.value / 1000) * perKmRate.car +
        (distanceTime.duration.value / 60) * perMinuteRate.car
    ),
    moto: Math.round(
      baseFare.moto +
        (distanceTime.distance.value / 1000) * perKmRate.moto +
        (distanceTime.duration.value / 60) * perMinuteRate.moto
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

  const fare = await getFare(pickup, destination);

  const ride = await rideModel.create({
    user,
    pickup,
    pickupLocation: {
      latitude: pickupCoordinates.ltd,  // Ensure API returns `ltd` for latitude
      longitude: pickupCoordinates.lng  // Ensure API returns `lng` for longitude
    },
    destination,
    destinationLocation: {
      latitude: destinationCoordinates.ltd,
      longitude: destinationCoordinates.lng
    },
    otp: getOtp(6),
    fare: fare[vehicleType],
  });

  return ride;
};

module.exports.confirmRide = async ({ rideId, captainId }) => {
  if (!rideId) {
    throw new Error("Ride id is required");
  }

  console.log("ye h captainId", captainId);

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

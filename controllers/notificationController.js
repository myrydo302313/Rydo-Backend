const admin = require("firebase-admin");
const Captain = require("../models/captain-model");

const serviceAccount = require("../firebase-service-account.json"); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

exports.sendRideNotification = async (req, res) => {
  try {
    const { rideId, message } = req.body;

    // Find captains
    const captains = await Captain.find({});

    // Send notification to all captains
    captains.forEach(async (captain) => {
      if (captain.fcmToken) {
        const payload = {
          notification: {
            title: "New Ride Request",
            body: message,
          },
          token: captain.fcmToken,
        };

        await admin.messaging().send(payload);
      }
    });

    return res.status(200).json({ message: "Notification sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const admin = require("firebase-admin");
const Captain = require("../models/captain-model");

// Fetch captains' FCM tokens
const getCaptainsFcmTokens = async (captainIds) => {
  try {
    const captains = await Captain.find({ _id: { $in: captainIds } }).select("fcmToken");
    return captains.map((c) => c.fcmToken).filter((token) => token); // Remove null tokens
  } catch (error) {
    console.error("❌ Error fetching FCM tokens:", error);
    return [];
  }
};

const sendPushNotification = async (tokens, title, body, iconUrl, data = {}) => {
    try {
      if (!tokens.length) {
        console.warn("⚠️ No FCM tokens available, skipping notification.");
        return;
      }
  
      // 🔍 Debugging: Check what is being received
      console.log("📢 Received title:", title);
      console.log("📢 Received body:", body);
  
      // Ensure title and body are valid strings
      const notificationTitle = typeof title === "string" ? title : JSON.stringify(title);
      const notificationBody = typeof body === "string" ? body : JSON.stringify(body);
  
      const notificationPayload = {
        tokens,
        notification: {
          title: notificationTitle || "New Notification",
          body: notificationBody || "You have a new message.",
        },
        webpush: {
          notification: {
            icon: iconUrl || "/images/rydoLogo3.png",
            badge: "/images/rydoLogo3.png",
            vibrate: [200, 100, 200],
          },
        },
        data, // Extra payload
      };
  
      console.log("🚀 Sending push notification:", JSON.stringify(notificationPayload, null, 2));
  
      const response = await admin.messaging().sendEachForMulticast(notificationPayload);
  
      console.log("✅ Push Notification Response:", JSON.stringify(response, null, 2));
  
      if (response.failureCount > 0) {
        response.responses.forEach((res, index) => {
          if (!res.success) {
            console.error(`❌ Failure for token ${tokens[index]}:`, res.error);
          }
        });
      }
    } catch (error) {
      console.error("❌ Error sending push notification:", error);
    }
  };
  
  

module.exports = {
  getCaptainsFcmTokens,
  sendPushNotification,
};

const admin = require("firebase-admin");

// Load Firebase credentials (service account key)
const serviceAccount = require("./config/firebase_service_account.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;

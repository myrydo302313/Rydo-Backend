const express = require("express");
const { saveFcmToken } = require("../controllers/notificationController");
const authMiddleware = require("../middlewares/auth-middleware");

const router = express.Router();

router.post("/save-fcm-token", saveFcmToken);

module.exports = router;

const express = require("express");
const { sendRideNotification } = require("../controllers/notificationController");

const router = express.Router();

router.post("/send", sendRideNotification);

module.exports = router;

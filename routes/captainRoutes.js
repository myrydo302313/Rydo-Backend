const express = require("express");
const authMiddleware = require("../middlewares/auth-middleware");
const { cancelledRides } = require("../controllers/captainController");

const router = express.Router();


router.get("/cancelled-rides", authMiddleware, cancelledRides);


module.exports = router;

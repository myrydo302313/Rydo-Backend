const express = require("express");
const authMiddleware = require("../middlewares/auth-middleware");
const { cancelledRides, completedRides } = require("../controllers/captainController");

const router = express.Router();


router.get("/cancelled-rides", authMiddleware, cancelledRides);
router.get("/completed-rides", authMiddleware, completedRides);


module.exports = router;

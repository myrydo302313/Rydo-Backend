const express = require("express");
const authMiddleware = require("../middlewares/auth-middleware");
const { cancelledRides, completedRides, availableRides, totalEarnings, completedRidesCount, totalDistance, totalCommission, acceptedRides } = require("../controllers/captainController");

const router = express.Router();


router.get("/available-rides", authMiddleware, availableRides);
router.get("/cancelled-rides", authMiddleware, cancelledRides);
router.get("/completed-rides", authMiddleware, completedRides);
router.get("/total-earnings", authMiddleware, totalEarnings);
router.get("/total-commission", authMiddleware, totalCommission);
router.get("/completed-rides-count", authMiddleware, completedRidesCount);
router.get("/total-distance", authMiddleware, totalDistance);
router.get("/accepted-rides", authMiddleware, acceptedRides);


module.exports = router;

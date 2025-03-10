const express = require("express");
const authMiddleware = require("../middlewares/auth-middleware");
const { cancelledRides, completedRides, availableRides } = require("../controllers/captainController");

const router = express.Router();


router.get("/available-rides", authMiddleware, availableRides);
router.get("/cancelled-rides", authMiddleware, cancelledRides);
router.get("/completed-rides", authMiddleware, completedRides);


module.exports = router;

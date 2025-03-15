const express = require("express");
const { totalCaptains, totalUsers, totalRides, getUsers, getCaptains, getRides } = require("../controllers/adminController");

const router = express.Router();

router.get("/total-users", totalUsers);
router.get("/total-captains", totalCaptains);
router.get("/total-rides", totalRides);
router.get("/getUsers", getUsers);
router.get("/getCaptains", getCaptains);
router.get("/getRides", getRides);



module.exports = router;

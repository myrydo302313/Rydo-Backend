const express = require("express");
const { totalCaptains, totalUsers, totalRides, getUsers } = require("../controllers/adminController");

const router = express.Router();

router.get("/total-users", totalUsers);
router.get("/total-captains", totalCaptains);
router.get("/total-rides", totalRides);
router.get("/getUsers", getUsers);



module.exports = router;

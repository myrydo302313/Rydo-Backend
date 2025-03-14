const express = require("express");
const authMiddleware = require("../middlewares/auth-middleware");
const { acceptedRides } = require("../controllers/userController");


const router = express.Router();


router.get("/accepted-rides", authMiddleware, acceptedRides);


module.exports = router;

const express = require("express");

const router = express.Router();
const {
  register,
  login,
  user,
} = require("../controllers/authController");

const authMiddleware = require("../middlewares/auth-middleware");


router.get("/user", authMiddleware, user);
router.post("/register", register);
router.post("/login", login);

module.exports = router;

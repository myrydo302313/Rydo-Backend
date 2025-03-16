const express = require("express");

const router = express.Router();
const {
  register,
  login,
  user,
  captainRegister,
  captainLogin,
  captain,
  requestPasswordReset,
  resetPassword,
} = require("../controllers/authController");

const authMiddleware = require("../middlewares/auth-middleware");

// User Routes
router.get("/user", authMiddleware, user);
router.post("/register", register);
router.post("/login", login);
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);

// Captain Routes
router.get("/captain", authMiddleware, captain);
router.post("/captainRegister", captainRegister);
router.post("/captainLogin", captainLogin);

module.exports = router;
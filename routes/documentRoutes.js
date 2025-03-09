const express = require("express");
const multer = require("multer");
const authMiddleware = require("../middlewares/auth-middleware");
const { uploadDriverLicense,  uploadProfilePic, uploadAadhaar } = require("../controllers/documentController");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Apply multer in the route file
const storage = multer.memoryStorage();
const uploadImg = multer({ storage });

const router = express.Router();

router.post("/upload-dl", authMiddleware, uploadImg.single("image"), uploadDriverLicense);
router.post("/upload-aadhaar", authMiddleware, uploadImg.single("image"), uploadAadhaar);
router.post("/upload-profilePic", authMiddleware, uploadImg.single("image"), uploadProfilePic);

module.exports = router;

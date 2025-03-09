const Captain = require("../models/captain-model");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

const uploadDriverLicense = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("Uploading to Cloudinary...");
    
    // Upload file to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: "image", folder: "license" },
        (err, res) => {
          if (err) reject(err);
          else resolve(res);
        }
      ).end(req.file.buffer);
    });

    const imageUrl = result.secure_url;
    console.log("Uploaded Image URL:", imageUrl);

    // Update Captain's DL URL
    const userId = req.userID;
    const captain = await Captain.findById(userId);

    if (!captain) {
      return res.status(404).json({ message: "User not found" });
    }

    captain.dl = imageUrl;
    await captain.save();

    res.status(200).json({ message: "Driver license uploaded successfully", imageUrl });
  } catch (e) {
    console.error("Error uploading driver license:", e);
    res.status(500).json({ message: "An error occurred while uploading the driver license" });
  }
};

const uploadAadhaar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("Uploading to Cloudinary...");
    
    // Upload file to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: "image", folder: "license" },
        (err, res) => {
          if (err) reject(err);
          else resolve(res);
        }
      ).end(req.file.buffer);
    });

    const imageUrl = result.secure_url;
    console.log("Uploaded Image URL:", imageUrl);

    // Update Captain's DL URL
    const userId = req.userID;
    const captain = await Captain.findById(userId);

    if (!captain) {
      return res.status(404).json({ message: "User not found" });
    }

    captain.aadhaar = imageUrl;
    await captain.save();

    res.status(200).json({ message: "Adhaar Card uploaded successfully", imageUrl });
  } catch (e) {
    console.error("Error uploading driver license:", e);
    res.status(500).json({ message: "An error occurred while uploading the Adhaar Card" });
  }
};

const uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("Uploading to Cloudinary...");
    
    // Upload file to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: "image", folder: "license" },
        (err, res) => {
          if (err) reject(err);
          else resolve(res);
        }
      ).end(req.file.buffer);
    });

    const imageUrl = result.secure_url;
    console.log("Uploaded Image URL:", imageUrl);

    // Update Captain's DL URL
    const userId = req.userID;
    const captain = await Captain.findById(userId);

    if (!captain) {
      return res.status(404).json({ message: "User not found" });
    }

    captain.profilePic = imageUrl;
    await captain.save();

    res.status(200).json({ message: "Profile Pic uploaded successfully", imageUrl });
  } catch (e) {
    console.error("Error uploading driver license:", e);
    res.status(500).json({ message: "An error occurred while uploading the Profile Pic" });
  }
};

module.exports = { uploadDriverLicense, uploadAadhaar, uploadProfilePic }; 

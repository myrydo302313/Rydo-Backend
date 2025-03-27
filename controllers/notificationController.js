const User = require("../models/user-model");
const Captain = require("../models/captain-model"); // Assuming a separate model for captains

// Controller to save FCM token
exports.saveFcmToken = async (req, res) => {
  try {

    const {userId, fcmToken, role } = req.body; // Expecting role in the request
    
    console.log('ye h data sb',userId);
    if (!fcmToken || !role || !userId) {
      return res.status(400).json({ message: "FCM token, role, and userId are required" });
    }

    let updatedUser;
    
    if (role === "user") {
      updatedUser = await User.findByIdAndUpdate(userId, { fcmToken }, { new: true });
    } else if (role === "captain") {
      updatedUser = await Captain.findByIdAndUpdate(userId, { fcmToken }, { new: true });
    } else {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    if (!updatedUser) {
      return res.status(404).json({ message: "User/Captain not found" });
    }

    res.status(200).json({ message: "FCM token saved successfully", data: updatedUser });
  } catch (error) {
    console.error("Error saving FCM token:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

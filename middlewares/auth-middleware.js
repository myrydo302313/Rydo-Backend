const jwt = require("jsonwebtoken");
const User = require("../models/user-model");
const Captain = require("../models/captain-model"); // Import Captain model

const authMiddleware = async (req, res, next) => {
    // Get token from headers
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ message: "Unauthorized, Token not provided" });
    }

    // Properly extract the token from "Bearer <token>"
    const jwtToken = token.split(" ")[1]; // This removes 'Bearer' and keeps the actual token

    if (!jwtToken) {
        return res.status(401).json({ message: "Unauthorized, Invalid token format" });
    }

    try {
        // Verify the token
        const isVerified = jwt.verify(jwtToken, process.env.JWT_SECRET_KEY);

        let userData;
        let userType;

        // Check if the request is for a user or a captain
        if (req.path.includes("/captain")) {
            userData = await Captain.findOne({ email: isVerified.email }).select("-password");
            userType = "captain";
        } else {
            userData = await User.findOne({ email: isVerified.email }).select("-password");
            userType = "user";
        }

        if (!userData) {
            return res.status(404).json({ message: `${userType} not found` });
        }

        // Attach user data and token to request
        req.user = userData;
        req.token = token;
        req.userID = userData._id;
        req.userType = userType; 

        next();
    } catch (error) {
        console.error("Error in authMiddleware:", error);
        return res.status(401).json({ message: "Unauthorized, Invalid token" });
    }
};

module.exports = authMiddleware;

const jwt = require('jsonwebtoken');
const User = require('../models/user-model');

const authMiddleware = async (req, res, next) => {
    // Get token from headers
    const token = req.header('Authorization');

    console.log('ye aya ',process.env.JWT_SECRET_KEY)

    if (!token) {
        return res.status(401).json({ message: "Unauthorized HTTP, Token not provided" });
    }

    // Properly extract the token from "Bearer <token>"
    const jwtToken = token.split(' ')[1]; // This will remove the 'Bearer' part and leave only the token

    if (!jwtToken) {
        return res.status(401).json({ message: "Unauthorized, Invalid token format" });
    }

    try {
        // Verify the token
        const isVerified = jwt.verify(jwtToken, process.env.JWT_SECRET_KEY);

        // Fetch user data from the database, excluding the password
        const userData = await User.findOne({ email: isVerified.email }).select('-password');

        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        // Attach user data and token to request
        req.user = userData;
        req.token = token;
        req.userID = userData._id;

        next();
    } catch (error) {
        console.error('Error in authMiddleware:', error);
        return res.status(401).json({ message: "Unauthorized, Invalid token" });
    }
};

module.exports = authMiddleware;

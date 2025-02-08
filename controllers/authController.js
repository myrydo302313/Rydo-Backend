const User = require("../models/user-model");
const bcrypt = require("bcryptjs");

const register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return res.status(400).json({ message: "Phone number already exists" });
    }

    const userRole = role || "user";

    const userCreated = await User.create({ name, email, phone, password, role: userRole });

    const token = await userCreated.generateToken();
    if (!token) {
      return res.status(500).json({ message: "Token generation failed" });
    }

    res.status(201).json({
      msg: "Registration Successful",
      token,
      userId: userCreated._id.toString(),
      role: userCreated.role,
    });
  } catch (e) {
    console.error("Registration Error:", e);
    res.status(500).send(e);
  }
};



const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userExists = await User.findOne({ email });

    if (!userExists) {
      return res.status(400).send("User doesn't exist");
    }

    const isMatch = await userExists.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json("Wrong Password");
    }

    res.status(200).json({
      msg: "Login Successful",
      token: await userExists.generateToken(),
      userId: userExists._id.toString(),
    });
  } catch (e) {
    res.status(500).json("Internal server error");
  }
};


const user = async (req, res) => {
  try {
    const userData = req.user;
    console.log(userData);
    return res.status(200).json({ userData });
  } catch (e) {
    console.log(e);
  }
};


const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Create reset URL
    const resetURL = `http://localhost:5173/reset-password/${resetToken}`;

    // Send email
    const emailContent = `
      <p>Hi ${user.name},</p>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetURL}">${resetURL}</a>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      html: emailContent,
    });

    res.status(200).json({ message: "Password reset link sent to email" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Check if password is provided
    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // Ensure the JWT_SECRET_KEY is correctly set
    const user = await User.findOne({
      _id: decoded.userId,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Check if token has expired
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash the new password before saving it to the database
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and clear reset token fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined; // Clear the reset token
    user.resetPasswordExpires = undefined; // Clear the expiration
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: error.message });
  }
};



module.exports = {register, login, user, forgotPassword, resetPassword };

const User = require("../models/user-model");
const Captain = require("../models/captain-model");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return res.status(400).json({ message: "Phone number already exists" });
    }

    const userCreated = await User.create({ name, email, phone, password });

    const token = await userCreated.generateToken();
    if (!token) {
      return res.status(500).json({ message: "Token generation failed" });
    }

    res.status(201).json({
      msg: "Registration Successful",
      token,
      userId: userCreated._id.toString(),
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
      return res.status(400).json({ message: "User doesn't exist" });
    }

    const isMatch = await userExists.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Wrong Password" });
    }

    res.status(200).json({
      msg: "Login Successful",
      token: await userExists.generateToken(),
      userId: userExists._id.toString(),
    });
  } catch (e) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const user = async (req, res) => {
  try {
    const userData = req.user;
    return res.status(200).json({ userData });
  } catch (e) {
    console.log(e);
  }
};

const captain = async (req, res) => {
  try {
    const captainData = req.user;

    return res.status(200).json({ captainData });
  } catch (e) {
    console.log(e);
  }
};

const captainRegister = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      vehicleName,
      vehicleType,
      vehicleNumber,
    } = req.body;

    const captainExists = await Captain.findOne({ email });
    if (captainExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const phoneExists = await Captain.findOne({ phone });
    if (phoneExists) {
      return res.status(400).json({ message: "Phone number already exists" });
    }

    const captainCreated = await Captain.create({
      name,
      email,
      phone,
      password,
      vehicleName,
      vehicleType,
      vehicleNumber,
      active: true,
    });

    const token = await captainCreated.generateToken();
    if (!token) {
      return res.status(500).json({ message: "Token generation failed" });
    }

    res.status(201).json({
      msg: "Registration Successful",
      token,
      userId: captainCreated._id.toString(),
    });
  } catch (e) {
    console.error("Registration Error:", e);
    res.status(500).send(e);
  }
};

const captainLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const captainExists = await Captain.findOne({ email });

    if (!captainExists) {
      return res.status(400).send({ message: "Email does not exists" });
    }

    const isMatch = await captainExists.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect Password" });
    }

    res.status(200).json({
      msg: "Login Successful",
      token: await captainExists.generateToken(),
      userId: captainExists._id.toString(),
    });
  } catch (e) {
    res.status(500).json("Internal server error");
  }
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendResetEmail = async (email, token) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Rydo Password Reset",
    text: `Dear User, We received a request to reset your password for your Rydo account. To proceed, please click the link below: www.myrydo.com/reset-password?token=${token}
            If you did not request this reset, please ignore this email. This link will expire shortly for security reasons.
            For any assistance, feel free to contact our support team.
            Best regards,  
            Rydo Support Team`,
  };

  await transporter.sendMail(mailOptions);
};

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    let user = await User.findOne({ email });
    let userType = "user";

    if (!user) {
      user = await Captain.findOne({ email });
      userType = "captain";
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const hash = await bcrypt.hash(token, 10);

    user.resetPasswordToken = hash;
    user.resetPasswordExpires = Date.now() + 3600000; // Token valid for 1 hour
    await user.save();

    console.log("Reset token saved for user:", user.email);

    await sendResetEmail(email, token);

    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Error requesting password reset:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    let user = await User.findOne({
      resetPasswordToken: { $exists: true },
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+resetPasswordToken");

    let userType = "user";

    if (!user) {
      user = await Captain.findOne({
        resetPasswordToken: { $exists: true },
        resetPasswordExpires: { $gt: Date.now() },
      }).select("+resetPasswordToken");
      userType = "captain";
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    if (!token || !user.resetPasswordToken) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Compare the token
    const isMatch = await bcrypt.compare(token, user.resetPasswordToken);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    console.log("Password Reset Initiated for:", user.email);

    // Hash new password manually (bypassing pre-save hook)
    const hash_password = await bcrypt.hash(newPassword, 10);
    user.password = hash_password;

    // Remove reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    console.log("password here", user.password);

    // Save without triggering pre-save hash (to avoid double hashing)
    await user.save({ validateBeforeSave: false });
    console.log("password there", user.password);

    console.log("Password successfully reset for:", user.email);

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  register,
  login,
  user,
  captain,
  captainRegister,
  captainLogin,
  requestPasswordReset,
  resetPassword,
};

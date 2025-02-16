const User = require("../models/user-model");
const Captain = require("../models/captain-model");
const bcrypt = require("bcryptjs");

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
    const { name, email, phone, password,vehicleName, vehicleType, vehicleNumber } =
      req.body;

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

module.exports = {
  register,
  login,
  user,
  captain,
  captainRegister,
  captainLogin,
};

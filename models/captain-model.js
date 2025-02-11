const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const captainSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  vehicleType: {
    type: String,
    enum: ["auto", "car", "two-wheeler"],
    required: true,
  },
  vehicleNumber: {
    type: String,
    required: true,
    unique: true,
  }
});

captainSchema.pre("save", async function (next) {
  const captain = this;

  if (!captain.isModified("password")) {
    next();
  }

  try {
    const saltRound = await bcrypt.genSalt(10);
    const hash_password = await bcrypt.hash(captain.password, saltRound);
    captain.password = hash_password;
  } catch (e) {
    next(e);
  }
});

captainSchema.methods.generateToken = async function () {
  try {
    return jwt.sign(
      {
        userId: this._id.toString(),
        name: this.name,
        email: this.email,
        vehicleType: this.vehicleType,
        vehicleNumber: this.vehicleNumber,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );
  } catch (e) {
    console.log("JWT Generation Error:", e);
  }
};

captainSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const Captain = mongoose.model("captains", captainSchema);

module.exports = Captain;

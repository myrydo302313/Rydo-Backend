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
  socketId: {
    type: String,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "inactive",
  },
  vehicleName: {
    type: String,
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
  },
  totalEarning: {
    type: Number,
  },
  earning: {
    type: Number,
  },
  commission: {
    type: Number,
  },
  active:{
    type:Boolean
  },
  location: {
    ltd: {
      type: Number,
      default: 0, // Ensures the field exists when a new captain is created
    },
    lng: {
      type: Number,
      default: 0, // Prevents "undefined" errors when updating location
    },
  },
  dl: {
    type: String,
  },
  aadhaar: {
    type: String,
  },
  profilePic: {
    type: String,
  },
});

captainSchema.pre("save", async function (next) {
  const user = this;

  if (!user.isModified("password")) {
    next();
  }

  try {
    const saltRound = await bcrypt.genSalt(10);
    const hash_password = await bcrypt.hash(user.password, saltRound);
    user.password = hash_password;
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

module.exports = mongoose.model("captains", captainSchema);

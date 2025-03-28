const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
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
  role: {
    type: String,
  },
  completedRides: {
    type: Number,
    default: 0,
  },
  socketId: {
    type: String,
  },
  fcmToken: {
    type: String,
  },
  resetPasswordToken: {
    type: String,
    select: false,
  },
  resetPasswordExpires: {
    type: Date,
    select: false,
  },
  fcmToken: { type: String },
});

userSchema.pre("save", async function (next) {
  const user = this;

  if (!this.isModified("password") || this.password.startsWith("$2a$")) {
    return next();
  }

  try {
    const saltRound = await bcrypt.genSalt(10);
    const hash_password = await bcrypt.hash(user.password, saltRound);
    user.password = hash_password;
  } catch (e) {
    next(e);
  }
});

userSchema.methods.generateToken = async function () {
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

userSchema.methods.comparePassword = async function (password) {
  console.log("Comparing password:", password);
  console.log("Comparing password:", this.password);

  console.log("Comparing password:", await bcrypt.compare(password, this.password));

  return bcrypt.compare(password, this.password);
};

const User = new mongoose.model("users", userSchema);

module.exports = User;
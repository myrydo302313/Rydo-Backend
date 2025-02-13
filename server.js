const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const authRoute = require("./routes/authRoutes");
const mapRoutes = require("./routes/mapRoutes");
const rideRoutes = require("./routes/rideRoutes");

dotenv.config();
const app = express();

const allowedOrigins = ["http://localhost:5173", "https://rydo.vercel.app"];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  preflightContinue: false,
};


app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Welcome to Rydo Backend");
});

app.use("/api/auth", authRoute);

app.use("/api/maps", mapRoutes);

app.use('/api/rides', rideRoutes);

connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");

dotenv.config();
const app = express();

// Allowed frontend origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://rydo.vercel.app",
  "https://rydo.vercel.app"
];

// CORS options
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200, // Prevents potential issues with some clients
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Explicitly handle preflight requests
app.options("*", cors(corsOptions));

// Middleware setup
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to Rydo Backend");
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/maps", require("./routes/mapRoutes"));
app.use("/api/rides", require("./routes/rideRoutes"));

// Connect to the database and start server
connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require('http');
const connectDB = require("./config/db");
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const { initializeSocket } = require('./socket');

const authRoute = require("./routes/authRoutes");
const mapRoutes = require("./routes/mapRoutes");
const rideRoutes = require("./routes/rideRoutes");

dotenv.config();
const app = express();

connectDB()


const corsOptions = {
  origin: "http://localhost:5173",
  // origin: "https://rydo.vercel.app",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
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

// connectDB().then(() => {
//   const PORT = process.env.PORT || 5000;
//   app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//   });
// });


const server = http.createServer(app);
initializeSocket(server);

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
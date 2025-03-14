const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require('http');
const connectDB = require("./config/db");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { initializeSocket } = require('./socket');

const authRoute = require("./routes/authRoutes");
const mapRoutes = require("./routes/mapRoutes");
const rideRoutes = require("./routes/rideRoutes");
const captainRoutes = require("./routes/captainRoutes");
const documentRoutes = require("./routes/documentRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

dotenv.config();
const app = express();

connectDB()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });


const corsOptions = {
  // origin: "http://localhost:5173",
  origin: "https://www.myrydo.com",
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

app.use('/api/captain', captainRoutes);

app.use('/api/documents',documentRoutes);

app.use("/api/payments", paymentRoutes); 


const server = http.createServer(app);
initializeSocket(server);

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
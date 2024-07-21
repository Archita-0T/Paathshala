const express = require("express");
const app = express();

const userRoutes = require("./routes/User");
const paymentRoutes = require("./routes/Payment");
const profileRoutes = require("./routes/Profile");
const CourseRoutes = require("./routes/Course");
const deleteJob = require('./jobs/deleteJob');
const fileUpload =require("express-fileupload")
const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");

const dotenv = require("dotenv");
const dbConnect = require("./config/database");
dotenv.config();

const PORT = process.env.PORT || 5000;
//establish db connection
dbConnect();
//middlewares
app.use(express.json());
app.use(cookieParser());
//middleware for frontend-backend conn
app.use(
  cors({
    origin:process.env.CORS_ORIGIN,
    credentials: true,
    maxAge: 14400,
  })
);

//middleware for fileupload
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/', // Ensure this directory is writable
  limits: { fileSize: 10 * 1024 * 1024 } // Limit the size to 10MB, for example
}));

//establish cloudinary connection
cloudinaryConnect();

// Logging middleware for debugging
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

//routes mounting
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", CourseRoutes);
app.use("/api/v1/contact", require("./routes/ContactUs"));

//default route
app.get("/", (req, res) => {
  res.status(200).json({
    success:true,
    message: "Server is running successfully",
  });
});

//start deletion job
deleteJob.startJob();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});



//activate the server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

server.timeout = 120000; // 2 minutes





const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const path = require('path');     //deployment
const app = express();



const userRoutes = require("./routes/User");
const paymentRoutes = require("./routes/Payments");
const profileRoutes = require("./routes/Profile");
const CourseRoutes = require("./routes/Course");

const database = require("./config/database");
const cookieParser = require("cookie-parser");

const cors = require("cors");
const fileUpload = require("express-fileupload");
const { cloudnairyconnect } = require("./config/cloudinary");



const PORT = process.env.PORT || 5000;
database.connect();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: JSON.parse(process.env.CORS_ORIGIN),
    credentials: true,
    maxAge: 14400,
  })
);

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

cloudnairyconnect();

app.use("/api/v1/auth", userRoutes);

app.use("/api/v1/payment", paymentRoutes);

app.use("/api/v1/profile", profileRoutes);

app.use("/api/v1/course", CourseRoutes);

app.use("/api/v1/contact", require("./routes/ContactUs"));


//--------------------------------------------DEPLOYMENT----------------------------------------------------
console.log('NODE_ENV:',process.env.NODE_ENV);
const __dirname1 = path.resolve();
if(process.env.NODE_ENV==='production'){
  app.use(express.static(path.join(__dirname1,"/frontend/build")));
  app.get('*', (req, res)=>{
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"));
  })

}
else{
  app.get("/", (req, res) => {
    res.status(200).json({
      message: "Welcome to the API",
    });
  });

}


//--------------------------------------------DEPLOYMENT----------------------------------------------------



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
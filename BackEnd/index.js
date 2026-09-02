require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fileUpload = require("express-fileupload");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(fileUpload({ useTempFiles: false }));

const port = process.env.PORT || 5000;

// Import Utilities
const { scheduleNoShowCancellations } = require("./Utilities/cronScheduling");

// MongoDB Connection & Startup
mongoose
  .connect(process.env.URL)
  .then(async () => {
    console.log("MongoDB Connected");

    try {
      await mongoose.connection.collection("reviews").dropIndex("hotelId_1");
      console.log("Old hotelId_1 index successfully removed from database!");
    } catch (err) {
      // Index does not exist
    }

    scheduleNoShowCancellations();
  })
  .catch((err) => console.log("DB Connection Error:", err));

// Import Routes
const signupRoute = require("./Route/signupRoute");
const stateRoute = require("./Route/stateRoute");
const districtRoute = require("./Route/districtRoute");
const cityRoute = require("./Route/cityRoute");
const adminRoute = require("./Route/adminRoute");
const hotelRoute = require("./Route/hotelRoute");
const couponRoute = require("./Route/couponRoute");
const roomRoute = require("./Route/roomRoute");
const bookingRoute = require("./Route/bookingRoute");
const temporaryRoute = require("./Route/temporaryRoute");
const reviewRoute = require("./Route/reviewRoute");
const dashboardRoute = require("./Route/dashboardRoute");

// Mount Routes
app.use("/userSignup", signupRoute);
app.use("/state", stateRoute);
app.use("/district", districtRoute);
app.use("/city", cityRoute);
app.use("/admin", adminRoute);
app.use("/hotel", hotelRoute);
app.use("/coupon", couponRoute);
app.use("/room", roomRoute);
app.use("/booking", bookingRoute);
app.use("/temporary", temporaryRoute);
app.use("/review", reviewRoute);
app.use("/dashboard", dashboardRoute);

// Health Check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Hotel Management System Backend is Running",
  });
});

// Start Server
app.listen(port, () => {
  console.log(`Server is Running on Port ${port}`);
});
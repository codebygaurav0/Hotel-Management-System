const express = require("express");
const router = express.Router();

const hotelController = require("../Controller/hotelController");

const auth = require("../Middleware/authMiddleware");
const admin = require("../Middleware/admin");
const superAdmin = require("../Middleware/superAdmin");
const adminOrSuperAdmin = require("../Middleware/adminOrSuperAdmin");

// ==========================
// 🟢 PUBLIC ROUTES
// ==========================
router.get("/public/all", hotelController.getAllPublicHotels);
router.get("/public/:id", hotelController.getPublicHotelById);
router.post("/checkStatus", hotelController.checkHotelStatus);

// ==========================
// 💥 DASHBOARD & GENERAL SPECIFIC ROUTES
// ==========================
router.get(
  "/particular-dashboard",
  auth,
  hotelController.getParticularHotelDashboard,
);
router.get("/my-hotels", auth, admin, hotelController.getMyHotels);
router.get("/active", auth, admin, hotelController.getActiveHotels);
router.get("/inactive", auth, admin, hotelController.getInactiveHotels);
router.get(
  "/pending",
  auth,
  adminOrSuperAdmin,
  hotelController.getPendingHotels,
);
router.get(
  "/approved",
  auth,
  adminOrSuperAdmin,
  hotelController.getApprovedHotels,
);
router.get(
  "/rejected",
  auth,
  adminOrSuperAdmin,
  hotelController.getRejectedHotels,
);
router.get("/all", auth, hotelController.getAllHotels);

// ==========================
// ADMIN & SUPER ADMIN ACTIONS
// ==========================
router.post("/create", auth, admin, hotelController.createHotel);
router.patch("/update/:id", auth, admin, hotelController.updateHotel);
router.patch(
  "/change-status/:id",
  auth,
  admin,
  hotelController.changeHotelStatus,
);
router.patch("/approve/:id", auth, superAdmin, hotelController.approveHotel);
router.patch("/reject/:id", auth, superAdmin, hotelController.rejectHotel);

// ==========================
// 🚨 DYNAMIC PARAMETER ROUTE (MUST BE AT THE VERY BOTTOM)
// ==========================
router.get("/:id", auth, hotelController.getHotelById);

module.exports = router;

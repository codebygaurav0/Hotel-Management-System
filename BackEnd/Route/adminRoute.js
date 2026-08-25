const express = require("express");
const router = express.Router();

const adminController = require("../Controller/adminController");

// 🚀 Email OTP Verification & Secure Admin Registration
router.post("/sendAdminSignupOtp", adminController.sendAdminSignupOtp);
router.post("/verifyAndCreateAdmin", adminController.verifyAndCreateAdmin);

// Specific GET Routes
router.get("/pending", adminController.getPendingAdminRequests);
router.get("/approved", adminController.getApprovedAdminRequests);
router.get("/rejected", adminController.getRejectedAdminRequests);

// Actions
router.patch("/approve/:id", adminController.approveAdminRequest);
router.patch("/reject/:id", adminController.rejectAdminRequest);
router.post("/sendOtp", adminController.sendOtp);
router.post("/verifyOtp", adminController.verifyOtp);
router.patch("/updateRequest/:id", adminController.updateRequest);

// 🚨 DYNAMIC PARAMETER ROUTE (MUST BE AT THE VERY BOTTOM)
router.get("/:id", adminController.getAdminById);

module.exports = router;

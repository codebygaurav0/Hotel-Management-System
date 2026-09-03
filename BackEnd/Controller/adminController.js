const adminModel = require("../Model/adminModel");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");
const signupModel = require("../Model/signupModel");
const sendEmail = require("../Utilities/NodeMailer");
const bcrypt = require("bcrypt");
const { uploadImage } = require("../Utilities/Cloudinary");

// ==========================================
// 1. STEP 1: Send OTP for Admin Signup
// ==========================================
const sendAdminSignupOtp = async (req, res) => {
  try {
    console.log("👉 [SEND_ADMIN_OTP] Request body received:", req.body);
    let { name, email, mobile } = req.body;

    if (!name?.trim() || !email?.trim() || !mobile?.trim()) {
      console.log(
        "❌ [SEND_ADMIN_OTP] Validation failed: Missing required fields",
      );
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    name = name.trim();
    email = email.trim().toLowerCase();
    mobile = mobile.trim();

    if (!/^[A-Za-z\s.]+$/.test(name)) {
      console.log("❌ [SEND_ADMIN_OTP] Validation failed: Invalid name format");
      return res.status(400).json({ success: false, message: "Invalid name" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.log(
        "❌ [SEND_ADMIN_OTP] Validation failed: Invalid email format",
      );
      return res
        .status(400)
        .json({ success: false, message: "Invalid email address" });
    }

    if (!/^[6-9][0-9]{9}$/.test(mobile)) {
      console.log(
        "❌ [SEND_ADMIN_OTP] Validation failed: Invalid mobile number",
      );
      return res
        .status(400)
        .json({ success: false, message: "Invalid mobile number" });
    }

    // Check if already approved/existing
    const existingRequest = await adminModel.findOne({ email });
    if (existingRequest && existingRequest.status === "Approved") {
      console.log(
        "⚠️ [SEND_ADMIN_OTP] Admin already approved for email:",
        email,
      );
      return res
        .status(400)
        .json({
          success: false,
          message: "Admin already exists with this email",
        });
    }

    const existingUser = await signupModel.findOne({ email });
    if (existingUser) {
      console.log(
        "⚠️ [SEND_ADMIN_OTP] User already exists in signupModel:",
        email,
      );
      return res
        .status(400)
        .json({
          success: false,
          message: "User already exists with this email",
        });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = Date.now() + 5 * 60 * 1000; // 5 minutes validity
    console.log(
      `🔑 [SEND_ADMIN_OTP] Generated OTP: ${otp} for email: ${email}`,
    );

    // Upsert pending/unverified temporary record
    let pendingAdmin = await adminModel.findOne({ email, status: "Pending" });

    if (!pendingAdmin) {
      console.log("📝 [SEND_ADMIN_OTP] Creating new pending admin record...");
      pendingAdmin = new adminModel({
        name,
        email,
        mobile,
        profileImage: "https://via.placeholder.com/150",
        trackingId: uuidv4(),
        status: "Pending",
        otp,
        otpExpire,
      });
    } else {
      console.log("🔄 [SEND_ADMIN_OTP] Updating existing pending admin OTP...");
      pendingAdmin.name = name;
      pendingAdmin.mobile = mobile;
      pendingAdmin.otp = otp;
      pendingAdmin.otpExpire = otpExpire;
    }

    await pendingAdmin.save();
    console.log(
      "💾 [SEND_ADMIN_OTP] Saved pending admin with tempId:",
      pendingAdmin._id,
    );

    const html = `
            <div style="max-width:600px;margin:auto;background:#F7F6F0;border:1px solid #E5E2D5;border-radius:16px;overflow:hidden;font-family:'Inter',Arial,sans-serif;color:#1B2537;">
                <div style="background:#1B2537;padding:35px;text-align:center;">
                    <h1 style="color:#ffffff;margin:0;font-size:22px;letter-spacing:1px;">Luxstay</h1>
                    <p style="color:#A2782E;margin:5px 0 0 0;font-size:10px;text-transform:uppercase;letter-spacing:2px;">Security Verification</p>
                </div>
                <div style="padding:40px;background:#ffffff;">
                    <h2 style="color:#1B2537;margin-top:0;font-size:20px;">Email Verification Code</h2>
                    <p style="font-size:14px;color:#555;line-height:1.6;">Hello <strong>${name}</strong>,</p>
                    <p style="font-size:14px;color:#555;line-height:1.6;">Please use the secure verification code below to proceed with your admin registration. Valid for 5 minutes.</p>
                    <div style="background:#F7F6F0;padding:25px;border-radius:12px;text-align:center;margin:30px 0;border:1px solid #E5E2D5;">
                        <span style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#1B2537;font-family:monospace;">${otp}</span>
                    </div>
                </div>
                <div style="background:#F7F6F0;padding:20px;text-align:center;color:#8C8676;font-size:11px;border-top:1px solid #E5E2D5;">
                    &copy; 2026 Luxstay. All rights reserved.
                </div>
            </div>
        `;

    await sendEmail(email, "🔐 Email Verification OTP — Luxstay", html);
    console.log("📧 [SEND_ADMIN_OTP] Verification email sent to:", email);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email",
      tempId: pendingAdmin._id,
    });
  } catch (error) {
    console.error("💥 [SEND_ADMIN_OTP] Server Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 2. STEP 2: Verify OTP, Upload Image & Send Tracking ID
// ==========================================
const verifyAndCreateAdmin = async (req, res) => {
  try {
    console.log("👉 [VERIFY_CREATE_ADMIN] Received data:", req.body);
    const { adminId, otp } = req.body;

    if (!adminId || !otp?.trim()) {
      console.log("❌ [VERIFY_CREATE_ADMIN] Missing adminId or OTP");
      return res
        .status(400)
        .json({ success: false, message: "Admin ID and OTP are required" });
    }

    const admin = await adminModel.findById(adminId);
    if (!admin) {
      console.log(
        "❌ [VERIFY_CREATE_ADMIN] Admin session not found for ID:",
        adminId,
      );
      return res
        .status(404)
        .json({
          success: false,
          message: "Registration session not found. Please try again.",
        });
    }

    if (admin.otp !== otp.trim()) {
      console.log("❌ [VERIFY_CREATE_ADMIN] Invalid OTP entered");
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP code" });
    }

    if (admin.otpExpire < Date.now()) {
      console.log("❌ [VERIFY_CREATE_ADMIN] OTP expired for adminId:", adminId);
      return res
        .status(400)
        .json({ success: false, message: "OTP has expired" });
    }

    // Handle Image Upload if provided in final step
    if (req.files?.profileImage) {
      console.log(
        "🖼️ [VERIFY_CREATE_ADMIN] Uploading profile image to Cloudinary...",
      );
      const profileImage = req.files.profileImage;
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];

      if (!allowedTypes.includes(profileImage.mimetype)) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Only JPG, JPEG, PNG and WEBP images are allowed",
          });
      }

      if (profileImage.size > 2 * 1024 * 1024) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Image size should not exceed 2 MB",
          });
      }

      const uploadedImage = await uploadImage(profileImage);
      admin.profileImage = uploadedImage[0].secure_url;
      console.log(
        "✅ [VERIFY_CREATE_ADMIN] Image uploaded successfully:",
        admin.profileImage,
      );
    }

    // Clear OTP & Finalize Tracking ID
    admin.otp = null;
    admin.otpExpire = null;
    const trackingId = admin.trackingId || uuidv4();
    admin.trackingId = trackingId;
    await admin.save();
    console.log(
      "💾 [VERIFY_CREATE_ADMIN] Admin updated with Tracking ID:",
      trackingId,
    );

    const html = `
            <div style="max-width:600px;margin:auto;background:#F7F6F0;border:1px solid #E5E2D5;border-radius:16px;overflow:hidden;font-family:'Inter',Arial,sans-serif;color:#1B2537;">
                <div style="background:#1B2537;padding:35px;text-align:center;">
                    <h1 style="color:#ffffff;margin:0;font-size:22px;letter-spacing:1px;">Luxstay</h1>
                    <p style="color:#A2782E;margin:5px 0 0 0;font-size:10px;text-transform:uppercase;letter-spacing:2px;">Executive Management</p>
                </div>
                <div style="padding:40px;background:#ffffff;">
                    <h2 style="color:#1B2537;margin-top:0;font-size:20px;">Admin Application Submitted</h2>
                    <p style="font-size:14px;color:#555;line-height:1.6;">Hello <strong>${admin.name}</strong>,</p>
                    <p style="font-size:14px;color:#555;line-height:1.6;">Your email has been verified and your admin registration request is now successfully submitted.</p>
                    <div style="background:#F7F6F0;padding:25px;border-radius:12px;text-align:center;margin:30px 0;border:1px solid #E5E2D5;">
                        <span style="font-size:11px;color:#8C8676;text-transform:uppercase;display:block;margin-bottom:8px;font-weight:bold;">Your Tracking ID</span>
                        <span style="font-size:18px;font-weight:bold;letter-spacing:2px;color:#1B2537;font-family:monospace;">${trackingId}</span>
                    </div>
                </div>
                <div style="background:#F7F6F0;padding:20px;text-align:center;color:#8C8676;font-size:11px;border-top:1px solid #E5E2D5;">
                    &copy; 2026 Luxstay. All rights reserved.
                </div>
            </div>
        `;

    await sendEmail(
      admin.email,
      "🛡️ Admin Application Received — Luxstay",
      html,
    );
    console.log(
      "📧 [VERIFY_CREATE_ADMIN] Application email sent to:",
      admin.email,
    );

    return res.status(201).json({
      success: true,
      message:
        "OTP verified successfully. Tracking ID has been sent to your email.",
      admin,
    });
  } catch (error) {
    console.error("💥 [VERIFY_CREATE_ADMIN] Server Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 3. Get Pending Requests
// ==========================================
// 3. Get Pending Requests (With Search, Sort & Pagination)
// ==========================================
const getPendingAdminRequests = async (req, res) => {
  try {
    console.log("🔍 [GET_PENDING_ADMINS] Fetching pending admin requests with filters...");
    
    // URL se query params nikalna
    const { search, sort = "desc", page = 1, limit = 10 } = req.query;

    // Base query (Sirf Pending status wale)
    let query = { status: "Pending" };

    // Agar search query aayi hai toh Name, Email, ya Tracking ID par filter lagayein
    if (search && search.trim() !== "") {
      const regex = new RegExp(search.trim(), "i"); // Case-insensitive search
      query.$or = [
        { name: regex },
        { email: regex },
        { trackingId: regex }
      ];
    }

    // Pagination calculations
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    // Sorting order ('desc' matlab naya pehle, 'asc' matlab purana pehle)
    const sortOrder = sort === "asc" ? 1 : -1;

    // Database se data aur total count fetch karna
    const [admins, totalRecords] = await Promise.all([
      adminModel.find(query)
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limitNumber),
      adminModel.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalRecords / limitNumber) || 1;

    console.log(`✅ [GET_PENDING_ADMINS] Found ${admins.length} pending request(s)`);

    return res.status(200).json({ 
      success: true, 
      count: admins.length, 
      admins,
      total: totalRecords,
      totalPages,
      currentPage: pageNumber
    });

  } catch (error) {
    console.log("💥 [GET_PENDING_ADMINS] Server Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 4. Get Approved Requests
// ==========================================
const getApprovedAdminRequests = async (req, res) => {
  try {
    console.log("🔍 [GET_APPROVED_ADMINS] Fetching approved admin requests...");
    const admins = await adminModel
      .find({ status: "Approved" })
      .sort({ createdAt: -1 });
    console.log(
      `✅ [GET_APPROVED_ADMINS] Found ${admins.length} approved admin(s)`,
    );
    res.status(200).json({ success: true, count: admins.length, admins });
  } catch (error) {
    console.error("💥 [GET_APPROVED_ADMINS] Server Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 5. Approve Admin Request (Without Transaction)
// ==========================================
const approveAdminRequest = async (req, res) => {
  try {
    console.log("👉 [APPROVE_ADMIN] Request received for ID:", req.params.id);

    const { password } = req.body;

    if (!password?.trim()) {
      console.log("❌ [APPROVE_ADMIN] Error: Password is missing");
      return res
        .status(400)
        .json({ success: false, message: "Password is required" });
    }

    if (password.trim().length < 6) {
      console.log("❌ [APPROVE_ADMIN] Error: Password length less than 6");
      return res
        .status(400)
        .json({
          success: false,
          message: "Password must be at least 6 characters",
        });
    }

    // 1. Check if Admin Request exists
    const admin = await adminModel.findById(req.params.id);
    if (!admin) {
      console.log(
        "❌ [APPROVE_ADMIN] Error: Admin request not found for ID:",
        req.params.id,
      );
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    if (admin.status === "Approved") {
      console.log("⚠️ [APPROVE_ADMIN] Warning: Admin is already approved");
      return res
        .status(400)
        .json({ success: false, message: "Admin already approved" });
    }

    if (admin.status === "Rejected") {
      console.log(
        "⚠️ [APPROVE_ADMIN] Warning: Cannot approve a rejected request",
      );
      return res
        .status(400)
        .json({
          success: false,
          message: "Rejected request cannot be approved",
        });
    }

    // 2. Check if User already exists in Signup Model
    const existingUser = await signupModel.findOne({ email: admin.email });
    if (existingUser) {
      console.log(
        "⚠️ [APPROVE_ADMIN] Warning: User already exists with email:",
        admin.email,
      );
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // 3. Hash Password
    console.log("🔑 [APPROVE_ADMIN] Hashing password for email:", admin.email);
    const hashPassword = await bcrypt.hash(password, 10);

    // 4. Create User in Signup Collection
    console.log("👤 [APPROVE_ADMIN] Creating new user in signupModel...");
    await signupModel.create({
      name: admin.name,
      email: admin.email,
      password: hashPassword,
      role: "admin",
    });

    // 5. Update Admin Status to Approved
    console.log(
      "📝 [APPROVE_ADMIN] Updating admin status to Approved in adminModel...",
    );
    admin.status = "Approved";
    admin.remark = "";
    await admin.save();

    // 6. Send Approval Email
    console.log("📧 [APPROVE_ADMIN] Sending approval email to:", admin.email);
    const html = `
            <div style="max-width:600px;margin:auto;background:#F7F6F0;border:1px solid #E5E2D5;border-radius:16px;overflow:hidden;font-family:'Inter',Arial,sans-serif;color:#1B2537;">
                <div style="background:#1B2537;padding:35px;text-align:center;">
                    <h1 style="color:#ffffff;margin:0;font-size:22px;letter-spacing:1px;">Luxstay</h1>
                    <p style="color:#A2782E;margin:5px 0 0 0;font-size:10px;text-transform:uppercase;letter-spacing:2px;">Executive Portal</p>
                </div>
                <div style="padding:40px;background:#ffffff;">
                    <h2 style="color:#1B2537;margin-top:0;font-size:20px;">Admin Account Approved! 🎉</h2>
                    <p style="font-size:14px;color:#555;line-height:1.6;">Hello <strong>${admin.name}</strong>,</p>
                    <p style="font-size:14px;color:#555;line-height:1.6;">Your admin application has been approved. You can now log into the management console using your credentials.</p>
                    <div style="background:#F7F6F0;padding:20px;border-radius:12px;margin:25px 0;border:1px solid #E5E2D5;">
                        <p style="margin:6px 0;font-size:13px;color:#555;"><strong>Email:</strong> ${admin.email}</p>
                        <p style="margin:6px 0;font-size:13px;color:#555;"><strong>Temporary Password:</strong> ${password}</p>
                    </div>
                </div>
                <div style="background:#F7F6F0;padding:20px;text-align:center;color:#8C8676;font-size:11px;border-top:1px solid #E5E2D5;">
                    &copy; 2026 Luxstay. All rights reserved.
                </div>
            </div>
        `;

    await sendEmail(
      admin.email,
      "✨ Admin Account Approved — Luxstay",
      html,
    );
    console.log("✅ [APPROVE_ADMIN] Admin approved successfully & email sent!");

    res
      .status(200)
      .json({ success: true, message: "Admin approved successfully" });
  } catch (error) {
    console.error("💥 [APPROVE_ADMIN] Server Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 6. Reject Admin Request
// ==========================================
const rejectAdminRequest = async (req, res) => {
  try {
    console.log("👉 [REJECT_ADMIN] Reject request for ID:", req.params.id);
    const { remark } = req.body;
    if (!remark?.trim()) {
      console.log("❌ [REJECT_ADMIN] Missing remark in body");
      return res
        .status(400)
        .json({ success: false, message: "Remark is required" });
    }

    const admin = await adminModel.findById(req.params.id);
    if (!admin) {
      console.log(
        "❌ [REJECT_ADMIN] Admin request not found for ID:",
        req.params.id,
      );
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    admin.status = "Rejected";
    admin.remark = remark.trim();
    await admin.save();
    console.log(
      "💾 [REJECT_ADMIN] Updated status to Rejected with remark:",
      remark,
    );

    const html = `
            <div style="max-width:600px;margin:auto;background:#F7F6F0;border:1px solid #E5E2D5;border-radius:16px;overflow:hidden;font-family:'Inter',Arial,sans-serif;color:#1B2537;">
                <div style="background:#1B2537;padding:35px;text-align:center;">
                    <h1 style="color:#ffffff;margin:0;font-size:22px;letter-spacing:1px;">Luxstay</h1>
                    <p style="color:#A2782E;margin:5px 0 0 0;font-size:10px;text-transform:uppercase;letter-spacing:2px;">Application Update</p>
                </div>
                <div style="padding:40px;background:#ffffff;">
                    <h2 style="color:#1B2537;margin-top:0;font-size:20px;">Admin Request Update</h2>
                    <p style="font-size:14px;color:#555;line-height:1.6;">Hello <strong>${admin.name}</strong>,</p>
                    <p style="font-size:14px;color:#555;line-height:1.6;">Unfortunately, your admin registration request could not be approved at this time.</p>
                    <div style="background:#FFF8F7;padding:20px;border-radius:12px;margin:25px 0;border:1px solid #E7C9C3;">
                        <p style="margin:0;font-size:13px;color:#8E3B30;"><strong>Reason:</strong> ${admin.remark}</p>
                    </div>
                </div>
                <div style="background:#F7F6F0;padding:20px;text-align:center;color:#8C8676;font-size:11px;border-top:1px solid #E5E2D5;">
                    &copy; 2026 Luxstay. All rights reserved.
                </div>
            </div>
        `;

    await sendEmail(
      admin.email,
      "⚠️ Admin Request Status Update — Luxstay",
      html,
    );
    console.log("📧 [REJECT_ADMIN] Rejection email sent to:", admin.email);

    res
      .status(200)
      .json({ success: true, message: "Request rejected successfully" });
  } catch (error) {
    console.error("💥 [REJECT_ADMIN] Server Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 7. Send Status OTP (Tracker)
// ==========================================
const sendOtp = async (req, res) => {
  try {
    console.log(
      "👉 [SEND_STATUS_OTP] Received tracking ID:",
      req.body.trackingId,
    );
    const { trackingId } = req.body;
    if (!trackingId?.trim()) {
      console.log("❌ [SEND_STATUS_OTP] Missing tracking ID");
      return res
        .status(400)
        .json({ success: false, message: "Tracking ID is required" });
    }

    const admin = await adminModel.findOne({ trackingId: trackingId.trim() });
    if (!admin) {
      console.log(
        "❌ [SEND_STATUS_OTP] Admin not found for tracking ID:",
        trackingId,
      );
      return res
        .status(404)
        .json({ success: false, message: "Invalid Tracking ID" });
    }

    if (admin.otp && admin.otpExpire && admin.otpExpire > Date.now()) {
      console.log("⚠️ [SEND_STATUS_OTP] OTP already active for:", admin.email);
      return res
        .status(400)
        .json({
          success: false,
          message: "OTP already sent. Please check your email.",
        });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    admin.otp = otp;
    admin.otpExpire = Date.now() + 2 * 60 * 1000; // 2 mins
    await admin.save();
    console.log(
      `🔑 [SEND_STATUS_OTP] New status OTP: ${otp} for email: ${admin.email}`,
    );

    const html = `
            <div style="max-width:600px;margin:auto;background:#F7F6F0;border:1px solid #E5E2D5;border-radius:16px;overflow:hidden;font-family:'Inter',Arial,sans-serif;color:#1B2537;">
                <div style="background:#1B2537;padding:35px;text-align:center;">
                    <h1 style="color:#ffffff;margin:0;font-size:22px;letter-spacing:1px;">Luxstay</h1>
                    <p style="color:#A2782E;margin:5px 0 0 0;font-size:10px;text-transform:uppercase;letter-spacing:2px;">Security Verification</p>
                </div>
                <div style="padding:40px;background:#ffffff;">
                    <h2 style="color:#1B2537;margin-top:0;font-size:20px;">Status Verification Code</h2>
                    <p style="font-size:14px;color:#555;line-height:1.6;">Hello <strong>${admin.name}</strong>,</p>
                    <p style="font-size:14px;color:#555;line-height:1.6;">Use the secure verification code below to view your admin application status. This code expires in 2 minutes.</p>
                    <div style="background:#F7F6F0;padding:25px;border-radius:12px;text-align:center;margin:30px 0;border:1px solid #E5E2D5;">
                        <span style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#1B2537;font-family:monospace;">${otp}</span>
                    </div>
                </div>
                <div style="background:#F7F6F0;padding:20px;text-align:center;color:#8C8676;font-size:11px;border-top:1px solid #E5E2D5;">
                    &copy; 2026 Luxstay. All rights reserved.
                </div>
            </div>
        `;

    await sendEmail(admin.email, "🔐 Verification OTP — Luxstay", html);
    console.log("📧 [SEND_STATUS_OTP] Status OTP email sent to:", admin.email);

    res
      .status(200)
      .json({
        success: true,
        message: "OTP sent successfully",
        email: admin.email,
      });
  } catch (error) {
    console.error("💥 [SEND_STATUS_OTP] Server Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 8. Verify Status OTP (Tracker)
// ==========================================
const verifyOtp = async (req, res) => {
  try {
    console.log(
      "👉 [VERIFY_STATUS_OTP] Verify attempt for tracking ID:",
      req.body.trackingId,
    );
    const { trackingId, otp } = req.body;
    if (!trackingId?.trim() || !otp?.trim()) {
      console.log("❌ [VERIFY_STATUS_OTP] Missing tracking ID or OTP");
      return res
        .status(400)
        .json({ success: false, message: "Tracking ID and OTP are required" });
    }

    const admin = await adminModel.findOne({ trackingId: trackingId.trim() });
    if (!admin) {
      console.log("❌ [VERIFY_STATUS_OTP] Invalid tracking ID");
      return res
        .status(404)
        .json({ success: false, message: "Invalid Tracking ID" });
    }

    if (!admin.otp || !admin.otpExpire) {
      console.log("⚠️ [VERIFY_STATUS_OTP] No OTP requested yet");
      return res
        .status(400)
        .json({ success: false, message: "Please request a new OTP" });
    }

    if (admin.otpExpire < Date.now()) {
      console.log("❌ [VERIFY_STATUS_OTP] Status OTP expired");
      admin.otp = "";
      admin.otpExpire = null;
      await admin.save();
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    if (admin.otp !== otp.trim()) {
      console.log("❌ [VERIFY_STATUS_OTP] Invalid OTP code");
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    console.log("✅ [VERIFY_STATUS_OTP] OTP verified successfully!");
    admin.otp = "";
    admin.otpExpire = null;
    await admin.save();

    res.status(200).json({
      success: true,
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        mobile: admin.mobile,
        profileImage: admin.profileImage,
        status: admin.status,
        trackingId: admin.trackingId,
        remark: admin.remark,
      },
    });
  } catch (error) {
    console.error("💥 [VERIFY_STATUS_OTP] Server Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 9. Get Admin by ID
// ==========================================
const getAdminById = async (req, res) => {
  try {
    console.log("🔍 [GET_ADMIN_BY_ID] Fetching admin for ID:", req.params.id);
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("❌ [GET_ADMIN_BY_ID] Invalid MongoDB ObjectId format");
      return res
        .status(400)
        .json({ success: false, message: "Invalid request id" });
    }

    const admin = await adminModel.findById(id);
    if (!admin) {
      console.log("❌ [GET_ADMIN_BY_ID] Admin not found for ID:", id);
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    console.log("✅ [GET_ADMIN_BY_ID] Found admin:", admin.email);
    res.status(200).json({
      success: true,
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        mobile: admin.mobile,
        profileImage: admin.profileImage,
        status: admin.status,
        trackingId: admin.trackingId,
      },
    });
  } catch (error) {
    console.error("💥 [GET_ADMIN_BY_ID] Server Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 10. Update Request
// ==========================================
const updateRequest = async (req, res) => {
  try {
    console.log("👉 [UPDATE_REQUEST] Update request for ID:", req.params.id);
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("❌ [UPDATE_REQUEST] Invalid ObjectId format");
      return res
        .status(400)
        .json({ success: false, message: "Invalid request id" });
    }

    const admin = await adminModel.findById(id);
    if (!admin) {
      console.log("❌ [UPDATE_REQUEST] Admin request not found");
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    if (admin.status !== "Pending") {
      console.log(
        "⚠️ [UPDATE_REQUEST] Cannot update non-pending request. Status:",
        admin.status,
      );
      return res
        .status(400)
        .json({
          success: false,
          message: "Only pending requests can be updated",
        });
    }

    let { name, email, mobile } = req.body;
    if (!name?.trim() || !email?.trim() || !mobile?.trim()) {
      console.log("❌ [UPDATE_REQUEST] Missing fields in body");
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    name = name.trim();
    email = email.trim().toLowerCase();
    mobile = mobile.trim();

    if (!/^[A-Za-z\s.]+$/.test(name)) {
      console.log("❌ [UPDATE_REQUEST] Invalid name format");
      return res.status(400).json({ success: false, message: "Invalid name" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.log("❌ [UPDATE_REQUEST] Invalid email format");
      return res
        .status(400)
        .json({ success: false, message: "Invalid email address" });
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      console.log("❌ [UPDATE_REQUEST] Invalid mobile format");
      return res
        .status(400)
        .json({ success: false, message: "Invalid mobile number" });
    }

    if (email !== admin.email) {
      const existing = await adminModel.findOne({ email });
      if (existing) {
        console.log(
          "⚠️ [UPDATE_REQUEST] New email already exists in DB:",
          email,
        );
        return res
          .status(400)
          .json({ success: false, message: "Email already exists" });
      }
    }

    admin.name = name;
    admin.email = email;
    admin.mobile = mobile;

    if (req.files?.profileImage) {
      console.log(
        "🖼️ [UPDATE_REQUEST] Updating profile image on Cloudinary...",
      );
      admin.profileImage = (
        await uploadImage({ profileImage: req.files.profileImage })
      )[0].secure_url;
      console.log("✅ [UPDATE_REQUEST] New image URL saved");
    }

    await admin.save();
    console.log("💾 [UPDATE_REQUEST] Admin request updated successfully!");

    res
      .status(200)
      .json({ success: true, message: "Request updated successfully", admin });
  } catch (error) {
    console.error("💥 [UPDATE_REQUEST] Server Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 11. Get Rejected Requests
// ==========================================
const getRejectedAdminRequests = async (req, res) => {
  try {
    console.log("🔍 [GET_REJECTED_ADMINS] Fetching rejected admin requests...");
    const admins = await adminModel.find({ status: "Rejected" });
    console.log(
      `✅ [GET_REJECTED_ADMINS] Found ${admins.length} rejected request(s)`,
    );
    res.status(200).json({ admins });
  } catch (error) {
    console.error("💥 [GET_REJECTED_ADMINS] Server Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  sendAdminSignupOtp,
  verifyAndCreateAdmin,
  getPendingAdminRequests,
  getApprovedAdminRequests,
  approveAdminRequest,
  rejectAdminRequest,
  sendOtp,
  verifyOtp,
  getAdminById,
  updateRequest,
  getRejectedAdminRequests,
};

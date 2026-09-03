const SignupModel = require("../Model/signupModel");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../Utilities/NodeMailer");

// 1. Send Signup OTP
const sendSignupOtp = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name?.trim() || !email?.trim() || !password?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Name, Email and Password are required",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check existing user
        const existingUser = await SignupModel.findOne({
            email: normalizedEmail,
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });
        }

        // Generate OTP
        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        const otpExpire = new Date(
            Date.now() + 5 * 60 * 1000
        );

        // Hash password
        const hash = await bcrypt.hash(password, 10);

        // OTP Email HTML
        const html = `
        <div style="
            max-width:600px;
            margin:auto;
            background:#F7F6F0;
            border:1px solid #E5E2D5;
            border-radius:16px;
            overflow:hidden;
            font-family:Arial,sans-serif;
            color:#1B2537;
        ">

            <div style="
                background:#1B2537;
                padding:35px;
                text-align:center;
            ">
                <h1 style="
                    color:#ffffff;
                    margin:0;
                    font-size:22px;
                    letter-spacing:1px;
                ">
                    Luxstay
                </h1>

                <p style="
                    color:#A2782E;
                    margin:5px 0 0;
                    font-size:10px;
                    text-transform:uppercase;
                    letter-spacing:2px;
                ">
                    Security Verification
                </p>
            </div>

            <div style="
                padding:40px;
                background:#ffffff;
            ">

                <h2 style="
                    color:#1B2537;
                    margin-top:0;
                ">
                    Email Verification Code
                </h2>

                <p style="
                    font-size:14px;
                    color:#555;
                    line-height:1.6;
                ">
                    Hello <strong>${name}</strong>,
                </p>

                <p style="
                    font-size:14px;
                    color:#555;
                    line-height:1.6;
                ">
                    Please use the following One-Time Password
                    to complete your registration.
                    This code expires in 5 minutes.
                </p>

                <div style="
                    background:#F7F6F0;
                    padding:25px;
                    border-radius:12px;
                    text-align:center;
                    margin:30px 0;
                    border:1px solid #E5E2D5;
                ">

                    <span style="
                        font-size:32px;
                        font-weight:bold;
                        letter-spacing:6px;
                        color:#1B2537;
                        font-family:monospace;
                    ">
                        ${otp}
                    </span>

                </div>

                <p style="
                    font-size:13px;
                    color:#888;
                ">
                    If you did not initiate this request,
                    please disregard this email.
                </p>

            </div>

            <div style="
                background:#F7F6F0;
                padding:20px;
                text-align:center;
                color:#8C8676;
                font-size:11px;
                border-top:1px solid #E5E2D5;
            ">
                © 2026 Luxstay.
                All rights reserved.
            </div>

        </div>
        `;

        // Send email through Brevo
        await sendEmail({
            to: normalizedEmail,
            subject: "🔐 Your Luxstay Verification Code",
            html: html,
        });

        // ONLY save user after email succeeds
        await SignupModel.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hash,
            otp,
            otpExpire,
            isVerified: false,
        });

        console.log("✅ Signup OTP sent:", normalizedEmail);

        return res.status(200).json({
            success: true,
            message: "Verification OTP sent successfully to your email",
        });

    } catch (error) {

        console.error("🔥 SIGNUP OTP FULL ERROR:", error);

        console.error(
            "Brevo Error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            success: false,
            message:
                error.response?.data?.message ||
                error.message ||
                "Failed to send verification OTP",
        });
    }
};

// 2. Verify Signup OTP
const verifySignupOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email?.trim() || !otp?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required",
            });
        }

        const user = await SignupModel.findOne({
            email: email.toLowerCase(),
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (user.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP code",
            });
        }

        if (user.otpExpire < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired",
            });
        }

        user.otp = null;
        user.otpExpire = null;
        user.isVerified = true;

        await user.save();

        const html = `
            <div style="max-width:600px;margin:auto;background:#F7F6F0;border:1px solid #E5E2D5;border-radius:16px;overflow:hidden;font-family:Arial,sans-serif;color:#1B2537;">

                <div style="background:#1B2537;padding:35px;text-align:center;">
                    <h1 style="color:#ffffff;margin:0;font-size:24px;">
                         Luxstay
                    </h1>

                    <p style="color:#A2782E;margin:5px 0;font-size:10px;text-transform:uppercase;letter-spacing:3px;">
                        Executive Collection
                    </p>
                </div>

                <div style="padding:40px;background:#ffffff;">

                    <h2 style="color:#1B2537;">
                        Welcome, ${user.name}! 🎉
                    </h2>

                    <p style="font-size:14px;color:#555;line-height:1.7;">
                        Thank you for registering with Luxstay.
                        Your account has been verified successfully.
                    </p>

                    <div style="background:#F7F6F0;padding:25px;border-radius:12px;margin:25px 0;border:1px solid #E5E2D5;">

                        <h3 style="color:#1B2537;">
                            Account Summary
                        </h3>

                        <p style="font-size:13px;color:#555;">
                            <strong>Name:</strong> ${user.name}
                        </p>

                        <p style="font-size:13px;color:#555;">
                            <strong>Email:</strong> ${user.email}
                        </p>

                    </div>

                    <p style="font-size:14px;color:#555;">
                        We are thrilled to accompany you on your travel journeys.
                    </p>

                    <p style="font-size:13px;color:#888;">
                        Warm Regards,<br>
                        <strong>The Luxstay Team</strong>
                    </p>

                </div>

                <div style="background:#F7F6F0;padding:20px;text-align:center;color:#8C8676;font-size:11px;">
                    This is an automated notification.
                </div>

            </div>
        `;

        // ✅ Brevo API
        await sendEmail({
            to: user.email,
            subject: "✨ Welcome to Luxstay — Account Verified",
            html: html,
        });

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "5d" }
        );

        return res.status(201).json({
            success: true,
            message: "Account verified and registered successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });

    } catch (error) {
        console.error("Verify Signup OTP Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// Create User
const signup = async (req, res) => {
    return sendSignupOtp(req, res);
};


// Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email?.trim() || !password?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Email and Password are required",
            });
        }

        const existingUser = await SignupModel.findOne({
            email: email.toLowerCase(),
        });

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "Email not found",
            });
        }

        const match = await bcrypt.compare(
            password,
            existingUser.password
        );

        if (!match) {
            return res.status(400).json({
                success: false,
                message: "Wrong Password",
            });
        }

        const token = jwt.sign(
            { id: existingUser._id },
            process.env.JWT_SECRET,
            { expiresIn: "5d" }
        );

        return res.status(200).json({
            success: true,
            message: "Login Successfully",
            token,
            user: {
                id: existingUser._id,
                name: existingUser.name,
                email: existingUser.email,
                role: existingUser.role,
            },
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// Forgot Password OTP
const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        console.log("📩 Send OTP Request:", email);
        console.log("🟢 MongoDB State:", mongoose.connection.readyState);

        if (!email?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const existingUser = await SignupModel.findOne({
            email: email.trim().toLowerCase(),
        });

        console.log("👤 User Found:", !!existingUser);

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "Email not found",
            });
        }

        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        await SignupModel.findByIdAndUpdate(
            existingUser._id,
            {
                otp,
                otpExpire: new Date(Date.now() + 5 * 60 * 1000),
            }
        );

        const html = `
            <div style="max-width:600px;margin:auto;background:#F7F6F0;padding:40px;border-radius:16px;font-family:Arial,sans-serif;">
                <h1 style="color:#1B2537;">Luxstay</h1>
                <h2>Password Reset OTP</h2>

                <p>
                    Hello <strong>${existingUser.name}</strong>,
                </p>

                <p>
                    Use this OTP to reset your password.
                    It is valid for 5 minutes.
                </p>

                <div style="background:#ffffff;padding:25px;text-align:center;border-radius:12px;">
                    <strong style="font-size:32px;letter-spacing:6px;">
                        ${otp}
                    </strong>
                </div>
            </div>
        `;

        console.log("📨 Sending OTP Email...");

        await sendEmail({
            to: existingUser.email,
            subject: "🔐 Password Reset OTP",
            html: html,
        });

        console.log("✅ OTP Email Sent");

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
        });

    } catch (error) {
        console.error("🔥 SEND OTP ERROR:", error);
        console.error("🔥 Message:", error.message);
        console.error("🔥 Response:", error.response?.data);

        return res.status(500).json({
            success: false,
            message: error.response?.data?.message || error.message,
        });
    }
};


// Verify OTP
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email?.trim() || !otp?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required",
            });
        }

        const existingUser = await SignupModel.findOne({
            email: email.toLowerCase(),
        });

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "Email not found",
            });
        }

        if (existingUser.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        if (existingUser.otpExpire < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "OTP Expired",
            });
        }

        return res.status(200).json({
            success: true,
            message: "OTP Verified",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// Forgot Password
const forgotPassword = async (req, res) => {
    try {
        const { email, password, confirmPassword } = req.body;

        if (!email?.trim() || !password?.trim() || !confirmPassword?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Email, Password and Confirm Password are required",
            });
        }

        const existingUser = await SignupModel.findOne({
            email: email.toLowerCase(),
        });

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "Email not found",
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters",
            });
        }

        const isSamePassword = await bcrypt.compare(
            password,
            existingUser.password
        );

        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: "New password cannot be the same as old password",
            });
        }

        const hash = await bcrypt.hash(password, 10);

        await SignupModel.findOneAndUpdate(
            { email: email.toLowerCase() },
            {
                password: hash,
                otp: null,
                otpExpire: null,
            }
        );

        return res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// Reset Password
const resetPassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;

        if (
            !oldPassword?.trim() ||
            !newPassword?.trim() ||
            !confirmPassword?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match",
            });
        }

        const match = await bcrypt.compare(
            oldPassword,
            req.user.password
        );

        if (!match) {
            return res.status(400).json({
                success: false,
                message: "Old password is incorrect",
            });
        }

        const samePassword = await bcrypt.compare(
            newPassword,
            req.user.password
        );

        if (samePassword) {
            return res.status(400).json({
                success: false,
                message: "New password cannot be same as old password",
            });
        }

        const hash = await bcrypt.hash(newPassword, 10);

        await SignupModel.findByIdAndUpdate(
            req.user._id,
            { password: hash }
        );

        return res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


module.exports = {
    signup,
    sendSignupOtp,
    verifySignupOtp,
    login,
    sendOtp,
    verifyOtp,
    forgotPassword,
    resetPassword,
};
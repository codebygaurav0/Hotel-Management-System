import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { signupApi } from "./api";
import { Hotel, Mail, Lock, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

const EyeIcon = ({ open }) =>
    open ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3l18 18" />
            <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
            <path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6 0 10 6 10 6a13.3 13.3 0 0 1-3.06 3.66M6.1 6.1C3.4 7.9 2 10 2 10s4 6 10 6a9 9 0 0 0 3.9-.9" />
        </svg>
    ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );

const ROLE_ROUTES = {
    user: "/signup",
    admin: "/admin/dashboard",
    superAdmin: "/superAdmin/state",
    hotel: "/hotel/hotelDashboard",
};

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formError, setFormError] = useState("");
    const [infoMessage, setInfoMessage] = useState("");

    useEffect(() => {
        if (location.state?.signupMessage) {
            setInfoMessage(location.state.signupMessage);
            navigate(location.pathname, {
                replace: true,
                state: {},
            });
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
        setFormError("");
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Enter a valid email address";
        }

        if (!formData.password.trim()) {
            newErrors.password = "Password is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");

        if (!validate()) return;

        try {
            setLoading(true);
            const response = await axios.post(`${signupApi}userSignup/login`, formData);
            const { token, user } = response.data;

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            setFormData({
                email: "",
                password: "",
            });

            navigate(ROLE_ROUTES[user.role] || "/user");
        } catch (error) {
            setFormError(
                error.response?.data?.message || "Login failed. Please check your credentials."
            );
        } finally {
            setLoading(false);
        }
    };

    // Field classes with emerald focus rings to match the LuxStay palette
    const fieldClass = (name) =>
        `w-full border pl-11 pr-11 h-12 text-sm font-medium rounded-xl outline-none transition-all bg-neutral-50/50 text-neutral-900 shadow-sm ${errors[name]
            ? "border-rose-300 focus:border-rose-500 bg-rose-50/20"
            : "border-neutral-200 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
        }`;

    const FieldError = ({ name }) =>
        errors[name] ? (
            <p id={`${name}-error`} role="alert" className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle size={14} />
                {errors[name]}
            </p>
        ) : null;

    return (
        <div className="min-h-screen w-full flex font-['Inter',sans-serif] bg-white">
            
            {/* Left Section - Premium Hotel Visual (Hidden on smaller screens, 50% width on large screens) */}
            <div className="hidden lg:flex w-1/2 bg-emerald-950 relative flex-col justify-between overflow-hidden p-12 xl:p-20">
                {/* Decorative Glass/Gradient Effects */}
                <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-emerald-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

                {/* Brand Identity */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-emerald-950 shadow-lg shadow-amber-500/20">
                        <Hotel size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight font-['Space_Grotesk',sans-serif]">HotelSuite</h2>
                        <p className="text-[10px] tracking-[0.2em] text-amber-400 font-bold uppercase">Management System</p>
                    </div>
                </div>

                {/* Main Hero Text */}
                <div className="relative z-10 my-auto w-full max-w-xl">
                    <h1 className="text-5xl xl:text-6xl font-extrabold text-white leading-[1.1] mb-6 font-['Space_Grotesk',sans-serif]">
                        Manage Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
                            Hotel Smarter.
                        </span>
                    </h1>
                    <p className="text-emerald-100/70 text-lg leading-relaxed mb-10 max-w-md">
                        Elevate your hospitality experience. Streamline bookings, manage properties, and delight your guests seamlessly from one powerful dashboard.
                    </p>

                    {/* Glassmorphism Trust Badge */}
                    <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-5 shadow-2xl inline-flex items-center gap-4">
                        <div className="flex -space-x-3">
                            <div className="w-10 h-10 rounded-full border-2 border-emerald-950 bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-800">JS</div>
                            <div className="w-10 h-10 rounded-full border-2 border-emerald-950 bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700">AK</div>
                            <div className="w-10 h-10 rounded-full border-2 border-emerald-950 bg-emerald-200 flex items-center justify-center text-xs font-bold text-emerald-700">+</div>
                        </div>
                        <div>
                            <p className="text-sm text-white font-medium">Trusted by 500+ Luxury Hotels</p>
                            <p className="text-xs text-amber-400/80 font-medium">Global hospitality leaders</p>
                        </div>
                    </div>
                </div>
                
                {/* Copyright/Footer note */}
                <p className="relative z-10 text-emerald-200/50 text-sm">
                    © {new Date().getFullYear()} HotelSuite Technologies. All rights reserved.
                </p>
            </div>

            {/* Right Section - Modern Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-white">
                
                {/* Mobile/Tablet Header Branding (Only visible when left section is hidden) */}
                <div className="absolute top-8 left-6 sm:left-12 lg:hidden flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-950 flex items-center justify-center text-amber-400">
                        <Hotel size={18} />
                    </div>
                    <span className="text-xl font-bold text-neutral-900 font-['Space_Grotesk',sans-serif]">HotelSuite</span>
                </div>

                <div className="w-full max-w-md">
                    {/* Form Header */}
                    <div className="mb-10">
                        <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 font-['Space_Grotesk',sans-serif] tracking-tight mb-2">
                            Welcome Back
                        </h2>
                        <p className="text-neutral-500 font-medium">
                            Please enter your details to access your account.
                        </p>
                    </div>

                    {/* Info Messages Alert */}
                    {infoMessage && (
                        <div role="status" className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50/50 text-emerald-800 text-sm px-4 py-3.5 flex items-start gap-3 font-medium shadow-sm">
                            <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={18} />
                            <span>{infoMessage}</span>
                        </div>
                    )}

                    {/* Failure Error Alert */}
                    {formError && (
                        <div role="alert" className="mb-6 rounded-xl border border-rose-200 bg-rose-50/50 text-rose-700 text-sm px-4 py-3.5 flex items-start gap-3 font-medium shadow-sm">
                            <AlertCircle className="mt-0.5 shrink-0 text-rose-600" size={18} />
                            <span>{formError}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate className="space-y-5">

                        {/* Email Input */}
                        <div>
                            <label htmlFor="login-email" className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2 font-['IBM_Plex_Mono']">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                                <input
                                    id="login-email"
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    placeholder="name@hotel.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    aria-invalid={!!errors.email}
                                    aria-describedby={errors.email ? "email-error" : undefined}
                                    className={fieldClass("email")}
                                />
                            </div>
                            <FieldError name="email" />
                        </div>

                        {/* Password Input */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="login-password" className="block text-xs font-bold uppercase tracking-wider text-neutral-600 font-['IBM_Plex_Mono']">
                                    Password
                                </label>
                                <Link to="/forgot" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 hover:underline underline-offset-4 transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                                <input
                                    id="login-password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    aria-invalid={!!errors.password}
                                    aria-describedby={errors.password ? "password-error" : undefined}
                                    className={fieldClass("password")}
                                />
                                <button
                                    type="button"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    aria-pressed={showPassword}
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition cursor-pointer p-1"
                                >
                                    <EyeIcon open={showPassword} />
                                </button>
                            </div>
                            <FieldError name="password" />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 rounded-xl font-bold text-sm uppercase tracking-wider bg-gradient-to-r from-emerald-700 to-amber-500 text-white hover:opacity-90 focus:ring-4 focus:ring-emerald-700/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-xl shadow-emerald-700/20 flex items-center justify-center gap-2 mt-6 cursor-pointer"
                        >
                            {loading && <Loader2 className="animate-spin" size={18} />}
                            {loading ? "Authenticating..." : "Sign In"}
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-10 pt-8 border-t border-neutral-100 flex flex-col items-center gap-3 text-sm text-center">
                        <p className="text-neutral-500 font-medium">
                            Looking to book a stay?{" "}
                            <Link to="/signup" className="text-neutral-900 font-bold hover:text-emerald-700 underline underline-offset-4 transition-colors">
                                Sign up as a guest
                            </Link>
                        </p>
                        <p className="text-neutral-500 font-medium">
                            Want to manage your property?{" "}
                            <Link to="/adminSignup" className="text-emerald-700 font-bold hover:text-emerald-800 underline underline-offset-4 transition-colors">
                                Partner with us
                            </Link>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Login;
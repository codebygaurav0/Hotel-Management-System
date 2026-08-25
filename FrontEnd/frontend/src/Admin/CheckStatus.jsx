import React, { useState } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signupApi } from "../api";
import {
  ShieldCheck,
  KeyRound,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileText,
  Clock,
  XCircle,
  Copy,
  Check,
  RotateCcw,
  Pencil,
} from "lucide-react";

const STATUS_CONFIG = {
  Approved: {
    badge: "bg-emerald-100/80 text-emerald-800 border-emerald-300",
    icon: <CheckCircle2 size={16} className="text-emerald-600" />,
    description: "Your request has been verified and approved!",
    progressClass: "w-full bg-emerald-500",
  },
  Rejected: {
    badge: "bg-rose-100/80 text-rose-800 border-rose-300",
    icon: <XCircle size={16} className="text-rose-600" />,
    description: "Your request was not approved. Please see remarks below.",
    progressClass: "w-1/2 bg-rose-500",
  },
  Pending: {
    badge: "bg-amber-100/80 text-amber-800 border-amber-300",
    icon: <Clock size={16} className="text-amber-600" />,
    description: "Your application is currently under review.",
    progressClass: "w-1/2 bg-amber-500",
  },
};

const normalizeStatus = (status) => {
  if (!status) return "Pending";
  const s = status.trim().toLowerCase();
  if (s === "approved") return "Approved";
  if (s === "rejected") return "Rejected";
  if (s === "pending") return "Pending";
  return status;
};

const CheckStatus = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [trackingId, setTrackingId] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState(
    location.state?.statusMessage || "",
  );
  const [otpSentMessage, setOtpSentMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!trackingId.trim()) {
      setError("Please enter your tracking ID");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setInfoMessage("");

      const response = await axios.post(`${signupApi}admin/sendOtp`, {
        trackingId,
      });

      setOtpSentMessage(
        response.data.message || "OTP sent successfully to registered details.",
      );
      setShowOtp(true);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Something went wrong. Please check your Tracking ID and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      setError("Please enter the verification OTP");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.post(`${signupApi}admin/verifyOtp`, {
        trackingId,
        otp,
      });

      setAdmin(response.data.admin);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Invalid OTP or session expired. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fieldClass =
    "w-full border pl-10 pr-3.5 h-12 rounded-xl text-xs font-medium outline-none transition-all bg-slate-50/70 text-slate-900 border-slate-200 focus:border-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900/5 shadow-xs";

  const statusKey = normalizeStatus(admin?.status);
  const currentConfig = STATUS_CONFIG[statusKey] || STATUS_CONFIG.Pending;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex items-center justify-center px-4 py-12 relative overflow-hidden antialiased">
      {/* Background Decorative Glows */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/50 relative z-10">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors mb-6 cursor-pointer font-mono tracking-wider uppercase"
        >
          <ArrowLeft size={15} /> Back
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-4 shadow-md shadow-slate-900/10">
            <FileText size={24} />
          </div>
          <span className="text-[10px] font-mono tracking-widest text-indigo-600 font-bold uppercase block mb-1">
            Application Tracker
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Check Request Status
          </h1>
          <p className="text-slate-500 text-xs mt-1.5 font-medium leading-relaxed">
            Enter your tracking ID and complete verification to view status
            updates.
          </p>
        </div>

        {/* Info Message */}
        {infoMessage && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-xs px-4 py-3 flex items-start gap-2.5 font-medium shadow-xs"
          >
            <CheckCircle2
              className="mt-0.5 shrink-0 text-amber-600"
              size={16}
            />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* OTP Sent Message */}
        {otpSentMessage && showOtp && !admin && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs px-4 py-3 flex items-start gap-2.5 font-medium shadow-xs"
          >
            <CheckCircle2
              className="mt-0.5 shrink-0 text-emerald-600"
              size={16}
            />
            <span>{otpSentMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs px-4 py-3 flex items-start gap-2.5 font-medium shadow-xs"
          >
            <AlertCircle className="mt-0.5 shrink-0 text-rose-600" size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Send OTP Form */}
        {!showOtp && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label
                htmlFor="tracking-id"
                className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 font-mono"
              >
                Tracking ID Number
              </label>
              <div className="relative">
                <ShieldCheck
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  id="tracking-id"
                  type="text"
                  placeholder="e.g. TRK-981023"
                  value={trackingId}
                  onChange={(e) => {
                    setTrackingId(e.target.value);
                    setError("");
                  }}
                  className={fieldClass}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl font-bold text-xs uppercase tracking-wider bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Sending Verification OTP...
                </>
              ) : (
                "Send Verification OTP"
              )}
            </button>
          </form>
        )}

        {/* Step 2: Verify OTP Form */}
        {showOtp && !admin && (
          <form
            onSubmit={handleVerifyOtp}
            className="space-y-4 animate-in fade-in duration-300"
          >
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label
                  htmlFor="otp"
                  className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono"
                >
                  Enter Verification OTP
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowOtp(false);
                    setOtp("");
                    setError("");
                  }}
                  className="text-[11px] text-indigo-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw size={12} /> Change ID
                </button>
              </div>

              <div className="relative">
                <KeyRound
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter 6-digit OTP code"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    setError("");
                  }}
                  className={fieldClass}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl font-bold text-xs uppercase tracking-wider bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Verifying OTP...
                </>
              ) : (
                "Verify & View Status"
              )}
            </button>
          </form>
        )}

        {/* Step 3: Admin Details Card */}
        {admin && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Status Timeline Progress */}
            <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                  Status Progress
                </span>
                <span
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border ${currentConfig.badge}`}
                >
                  {currentConfig.icon} {statusKey}
                </span>
              </div>

              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full transition-all duration-500 ${currentConfig.progressClass}`}
                />
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-snug">
                {currentConfig.description}
              </p>
            </div>

            {/* Application Detail Summary Table */}
            <div className="border border-slate-200/80 rounded-2xl p-5 bg-white space-y-3 text-xs">
              {admin.profileImage && (
                <div className="text-center pb-2">
                  <img
                    src={admin.profileImage}
                    alt={`${admin.name}'s profile`}
                    className="w-16 h-16 rounded-2xl object-cover mx-auto mb-2 border border-slate-200 shadow-xs"
                  />
                </div>
              )}

              <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                <span className="text-slate-400 font-bold uppercase tracking-wider font-mono text-[10px]">
                  Applicant Name
                </span>
                <span className="font-bold text-slate-900">{admin.name}</span>
              </div>

              <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                <span className="text-slate-400 font-bold uppercase tracking-wider font-mono text-[10px]">
                  Email Address
                </span>
                <span className="font-semibold text-slate-800">
                  {admin.email}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                <span className="text-slate-400 font-bold uppercase tracking-wider font-mono text-[10px]">
                  Mobile Phone
                </span>
                <span className="font-semibold text-slate-800">
                  {admin.mobile}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                <span className="text-slate-400 font-bold uppercase tracking-wider font-mono text-[10px]">
                  Tracking ID
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(admin.trackingId)}
                  className="font-mono font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded cursor-pointer transition"
                  title="Click to copy"
                >
                  {admin.trackingId}
                  {copied ? (
                    <Check size={12} className="text-emerald-600" />
                  ) : (
                    <Copy size={12} />
                  )}
                </button>
              </div>

              {/* Rejection Remark */}
              {statusKey === "Rejected" && admin.remark && (
                <div className="pt-2">
                  <div className="text-rose-800 bg-rose-50/80 p-3.5 rounded-xl border border-rose-200/80 text-xs">
                    <span className="font-bold block mb-0.5 text-rose-900">
                      Reason for Rejection:
                    </span>
                    <p className="text-rose-700">{admin.remark}</p>
                  </div>
                </div>
              )}

              {/* Edit Request CTA for Pending Applications */}
              {statusKey === "Pending" && (
                <button
                  type="button"
                  onClick={() => navigate(`/adminSignup/${admin._id}`)}
                  className="w-full mt-3 h-11 rounded-xl font-bold text-xs uppercase tracking-wider bg-slate-900 text-white hover:bg-slate-800 transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Pencil size={14} /> Edit Request Details
                </button>
              )}
            </div>

            {/* Reset Search Button */}
            <button
              type="button"
              onClick={() => {
                setAdmin(null);
                setShowOtp(false);
                setOtp("");
                setTrackingId("");
              }}
              className="w-full h-11 rounded-xl font-bold text-xs uppercase tracking-wider border border-slate-300 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Check Another Request
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-500 font-medium">
          Already verified or have credentials?{" "}
          <Link
            to="/login"
            className="text-slate-900 font-bold hover:text-indigo-600 underline underline-offset-4"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckStatus;

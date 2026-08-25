import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { signupApi } from "../api";
import {
  Building2,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Copy,
  Check,
  Search,
} from "lucide-react";

const STATUS_CONFIG = {
  Approved: {
    badge: "bg-emerald-100/80 text-emerald-800 border-emerald-300",
    icon: <CheckCircle2 size={16} className="text-emerald-600" />,
    description: "Your application has been verified and approved!",
    step: 3,
  },
  Rejected: {
    badge: "bg-rose-100/80 text-rose-800 border-rose-300",
    icon: <XCircle size={16} className="text-rose-600" />,
    description: "Your application was not approved. Check remarks below.",
    step: 2,
  },
  Pending: {
    badge: "bg-amber-100/80 text-amber-800 border-amber-300",
    icon: <Clock size={16} className="text-amber-600" />,
    description: "Your application is under review by our admin team.",
    step: 2,
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

const CheckHotelStatus = () => {
  const navigate = useNavigate();

  const [trackingId, setTrackingId] = useState("");
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCheckStatus = async (e) => {
    e.preventDefault();

    if (!trackingId.trim()) {
      setError("Please enter your tracking ID");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.post(`${signupApi}hotel/checkStatus`, {
        trackingId,
      });

      setHotel(response.data.data);
    } catch (err) {
      setHotel(null);
      setError(
        err.response?.data?.message ||
          "Something went wrong. Unable to fetch details."
      );
    }  finally {
  setLoading(false);
}
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusKey = normalizeStatus(hotel?.status);
  const currentConfig = STATUS_CONFIG[statusKey] || STATUS_CONFIG.Pending;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex items-center justify-center px-4 py-12 relative overflow-hidden antialiased">
      {/* Decorative Background Lighting */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/50 relative z-10 transition-all">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-800 transition-colors mb-6 cursor-pointer tracking-wider uppercase font-mono"
        >
          <ArrowLeft size={15} /> Back
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-4 shadow-md shadow-slate-900/10">
            <Building2 size={24} />
          </div>
          <span className="text-[10px] font-mono tracking-widest text-indigo-600 font-bold uppercase block mb-1">
            Application Status Tracker
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Check Hotel Submission
          </h1>
          <p className="text-slate-500 text-xs mt-1.5 font-medium leading-relaxed">
            Enter your unique property tracking ID to view real-time verification progress.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs p-4 flex items-start gap-2.5 font-medium shadow-xs"
          >
            <AlertCircle className="mt-0.5 shrink-0 text-rose-600" size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form Area */}
        {!hotel && (
          <form onSubmit={handleCheckStatus} className="space-y-4">
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
                  placeholder="e.g. HTL-893041"
                  value={trackingId}
                  onChange={(e) => {
                    setTrackingId(e.target.value);
                    setError("");
                  }}
                  className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 h-12 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-900/5 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl font-bold text-xs uppercase tracking-wider bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Fetching Details...
                </>
              ) : (
                <>
                  <Search size={15} /> Check Status
                </>
              )}
            </button>
          </form>
        )}

        {/* Hotel Details Card */}
        {hotel && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Status Stepper Progress Bar */}
            <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                  Status Timeline
                </span>
                <span
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border ${currentConfig.badge}`}
                >
                  {currentConfig.icon} {statusKey}
                </span>
              </div>

              {/* Progress Line Bar */}
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full transition-all duration-500 ${
                    statusKey === "Approved"
                      ? "w-full bg-emerald-500"
                      : statusKey === "Rejected"
                      ? "w-1/2 bg-rose-500"
                      : "w-1/2 bg-amber-500"
                  }`}
                />
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-snug">
                {currentConfig.description}
              </p>
            </div>

            {/* Property Detail Summary Table */}
            <div className="border border-slate-200/80 rounded-2xl p-5 bg-white space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                <span className="text-slate-400 font-bold uppercase tracking-wider font-mono text-[10px]">
                  Property Name
                </span>
                <span className="font-bold text-slate-900">
                  {hotel.hotelName || "N/A"}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                <span className="text-slate-400 font-bold uppercase tracking-wider font-mono text-[10px]">
                  Owner Name
                </span>
                <span className="font-semibold text-slate-800">
                  {hotel.ownerName || "N/A"}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                <span className="text-slate-400 font-bold uppercase tracking-wider font-mono text-[10px]">
                  Contact Email
                </span>
                <span className="font-semibold text-slate-800">
                  {hotel.hotelEmail || "N/A"}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                <span className="text-slate-400 font-bold uppercase tracking-wider font-mono text-[10px]">
                  Tracking ID
                </span>
                <button
                  onClick={() => copyToClipboard(hotel.trackingId)}
                  className="font-mono font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded cursor-pointer transition"
                  title="Click to copy"
                >
                  {hotel.trackingId}
                  {copied ? (
                    <Check size={12} className="text-emerald-600" />
                  ) : (
                    <Copy size={12} />
                  )}
                </button>
              </div>

              <div className="flex justify-between items-center pt-0.5">
                <span className="text-slate-400 font-bold uppercase tracking-wider font-mono text-[10px]">
                  Submitted Date
                </span>
                <span className="font-semibold text-slate-800">
                  {hotel.createdAt
                    ? new Date(hotel.createdAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>

              {/* Rejection Remark */}
              {statusKey === "Rejected" && hotel.remark && (
                <div className="pt-3">
                  <div className="text-rose-800 bg-rose-50/80 p-3.5 rounded-xl border border-rose-200/80 text-xs">
                    <span className="font-bold block mb-0.5 text-rose-900">
                      Reason for Rejection:
                    </span>
                    <p className="text-rose-700">{hotel.remark}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <button
              onClick={() => {
                setHotel(null);
                setTrackingId("");
              }}
              className="w-full h-11 rounded-xl font-bold text-xs uppercase tracking-wider bg-slate-900 text-white hover:bg-slate-800 transition shadow-xs cursor-pointer"
            >
              Search Another Property
            </button>
          </div>
        )}

        {/* Footer Link */}
        <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-500 font-medium">
          Already have an operational account?{" "}
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

export default CheckHotelStatus;
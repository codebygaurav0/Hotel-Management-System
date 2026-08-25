import React, { useEffect, useState } from "react";
import axiosInstance from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { signupApi } from "../api";
import {
  ArrowLeft,
  Loader2,
  Ticket,
  Sparkles,
  Percent,
  Calendar,
  ShieldCheck,
  DollarSign,
  Hash,
  CheckCircle2,
} from "lucide-react";

const AddCoupon = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    couponCode: "",
    discountType: "Percentage",
    discountValue: "",
    minBookingAmount: "",
    expiryDate: "",
    maxUses: "",
    status: "Active",
  });

  const discountTypes = ["Percentage", "Fixed Amount"];
  const statusOptions = ["Active", "Inactive"];

  useEffect(() => {
    if (id) getCouponById();
  }, [id]);

  const getCouponById = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axiosInstance.get(`${signupApi}coupon/${id}`, { headers });
      const coupon = response.data.result;

      let formattedExpiry = "";
      if (coupon.expiryDate) {
        formattedExpiry = new Date(coupon.expiryDate).toISOString().split("T")[0];
      }

      setForm({
        couponCode: coupon.couponCode || "",
        discountType: coupon.discountType || "Percentage",
        discountValue: coupon.discountValue || "",
        minBookingAmount: coupon.minBookingAmount !== undefined ? coupon.minBookingAmount : "",
        expiryDate: formattedExpiry,
        maxUses: coupon.maxUses !== undefined ? coupon.maxUses : "",
        status: coupon.status || "Active",
      });
    } catch (error) {
      console.error("Fetch coupon error:", error);
    }  finally {
  setLoading(false);
}
  };

  const validate = () => {
    let newErrors = {};

    if (!form.couponCode.trim()) {
      newErrors.couponCode = "Coupon Code is required";
    } else if (form.couponCode.trim().length < 4) {
      newErrors.couponCode = "Minimum 4 characters required";
    }

    if (!form.discountValue || Number(form.discountValue) <= 0) {
      newErrors.discountValue = "Must be greater than 0";
    } else if (form.discountType === "Percentage" && Number(form.discountValue) > 100) {
      newErrors.discountValue = "Percentage cannot exceed 100%";
    }

    if (!form.expiryDate) {
      newErrors.expiryDate = "Expiry date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "couponCode" ? value.toUpperCase() : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      if (id) {
        const response = await axiosInstance.patch(`${signupApi}coupon/update/${id}`, form, { headers });
        alert(response.data.message || "Coupon successfully modified.");
      } else {
        const response = await axiosInstance.post(`${signupApi}coupon/create`, form, { headers });
        alert(response.data.message || "Coupon successfully deployed.");
      }
      navigate("/admin/dashboard");
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && id && !form.couponCode) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[450px] gap-4 bg-[#F5F4EF] text-[#1B2537]">
        <Loader2 className="animate-spin text-[#A2782E]" size={40} />
        <h2 className="font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-[0.2em] font-bold text-[#8C8676]">
          Loading Coupon Details...
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-[780px] mx-auto text-[#1B2537] font-['Inter',sans-serif]">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#7A7565] hover:text-[#1B2537] transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5F4EF] border border-[#E1DECF] text-[#8C8676] text-[10px] font-['IBM_Plex_Mono'] font-bold tracking-wider uppercase">
          <Sparkles size={12} className="text-[#A2782E]" /> Coupon Engine
        </div>
      </div>

      {/* Ticket Container */}
      <div className="relative bg-white rounded-2xl border border-[#E1DECF] shadow-sm overflow-hidden">
        {/* Accent Top Bar */}
        <div className="h-1.5 bg-gradient-to-r from-[#1B2537] via-[#A2782E] to-[#1B2537]"></div>

        {/* Header Section */}
        <div className="p-6 sm:p-8 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 font-['IBM_Plex_Mono'] text-[10px] font-bold tracking-widest text-[#A2782E] uppercase bg-[#FAF9F5] px-2.5 py-1 rounded border border-[#E1DECF] mb-2">
                <Ticket size={12} /> {id ? "Voucher Revision Mode" : "Voucher Creation Mode"}
              </span>
              <h1 className="text-2xl font-bold font-['Space_Grotesk'] tracking-tight text-[#1B2537]">
                {id ? "Edit Campaign Coupon" : "Create New Coupon"}
              </h1>
            </div>

            <div className={`px-3.5 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 self-start sm:self-center ${
              form.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
            }`}>
              <span className={`w-2 h-2 rounded-full ${form.status === "Active" ? "bg-emerald-500" : "bg-rose-500"}`}></span>
              {form.status} Status
            </div>
          </div>
        </div>

        <div className="border-t border-dashed border-[#E1DECF] my-2 mx-8"></div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 pt-4">
          <div className="grid md:grid-cols-2 gap-5">
            {/* Coupon Code */}
            <div className="md:col-span-2">
              <label className="block mb-1.5 text-xs font-bold uppercase tracking-wider text-[#1B2537] flex items-center gap-1.5">
                <Hash size={14} className="text-[#A2782E]" /> Coupon Code *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="couponCode"
                  value={form.couponCode}
                  onChange={handleChange}
                  placeholder="e.g. FESTIVE2026"
                  className="w-full bg-[#FCFBF9] border border-[#E1DECF] text-[#1B2537] placeholder-[#A39C89] text-sm font-['IBM_Plex_Mono'] font-bold rounded-xl px-4 h-12 outline-none focus:border-[#A2782E] focus:bg-white transition uppercase tracking-widest"
                />
                {form.couponCode && (
                  <span className="absolute right-3.5 top-3.5 text-emerald-600">
                    <CheckCircle2 size={18} />
                  </span>
                )}
              </div>
              {errors.couponCode && <p className="text-red-500 text-[11px] font-medium mt-1">✕ {errors.couponCode}</p>}
            </div>

            {/* Discount Type */}
            <div>
              <label className="block mb-1.5 text-xs font-bold uppercase tracking-wider text-[#1B2537] flex items-center gap-1.5">
                <Percent size={14} className="text-[#A2782E]" /> Discount Type
              </label>
              <select
                name="discountType"
                value={form.discountType}
                onChange={handleChange}
                className="w-full bg-[#FCFBF9] border border-[#E1DECF] text-[#1B2537] text-xs font-semibold rounded-xl px-3.5 h-11 outline-none focus:border-[#A2782E] focus:bg-white transition cursor-pointer"
              >
                {discountTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === "Percentage" ? "Percentage Reduction (%)" : "Flat Amount Off (₹)"}
                  </option>
                ))}
              </select>
            </div>

            {/* Discount Value */}
            <div>
              <label className="block mb-1.5 text-xs font-bold uppercase tracking-wider text-[#1B2537] flex items-center gap-1.5">
                <DollarSign size={14} className="text-[#A2782E]" /> Discount Value *
              </label>
              <input
                type="number"
                name="discountValue"
                value={form.discountValue}
                onChange={handleChange}
                placeholder={form.discountType === "Percentage" ? "e.g. 20" : "e.g. 500"}
                className="w-full bg-[#FCFBF9] border border-[#E1DECF] text-[#1B2537] text-xs font-semibold rounded-xl px-3.5 h-11 outline-none focus:border-[#A2782E] focus:bg-white transition"
              />
              {errors.discountValue && <p className="text-red-500 text-[11px] font-medium mt-1">✕ {errors.discountValue}</p>}
            </div>

            {/* Min Booking Amount */}
            <div>
              <label className="block mb-1.5 text-xs font-bold uppercase tracking-wider text-[#1B2537]">
                Min Order Spend (₹)
              </label>
              <input
                type="number"
                name="minBookingAmount"
                value={form.minBookingAmount}
                onChange={handleChange}
                placeholder="e.g. 1500 (Optional)"
                className="w-full bg-[#FCFBF9] border border-[#E1DECF] text-[#1B2537] text-xs font-semibold rounded-xl px-3.5 h-11 outline-none focus:border-[#A2782E] focus:bg-white transition"
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block mb-1.5 text-xs font-bold uppercase tracking-wider text-[#1B2537] flex items-center gap-1.5">
                <Calendar size={14} className="text-[#A2782E]" /> Expiration Date *
              </label>
              <input
                type="date"
                name="expiryDate"
                value={form.expiryDate}
                onChange={handleChange}
                className="w-full bg-[#FCFBF9] border border-[#E1DECF] text-[#1B2537] text-xs font-semibold rounded-xl px-3.5 h-11 outline-none focus:border-[#A2782E] focus:bg-white transition cursor-pointer"
              />
              {errors.expiryDate && <p className="text-red-500 text-[11px] font-medium mt-1">✕ {errors.expiryDate}</p>}
            </div>

            {/* Max Uses */}
            <div>
              <label className="block mb-1.5 text-xs font-bold uppercase tracking-wider text-[#1B2537]">
                Max Claims Limit
              </label>
              <input
                type="number"
                name="maxUses"
                value={form.maxUses}
                onChange={handleChange}
                placeholder="e.g. 100 max claims"
                className="w-full bg-[#FCFBF9] border border-[#E1DECF] text-[#1B2537] text-xs font-semibold rounded-xl px-3.5 h-11 outline-none focus:border-[#A2782E] focus:bg-white transition"
              />
            </div>

            {/* Status Select */}
            <div>
              <label className="block mb-1.5 text-xs font-bold uppercase tracking-wider text-[#1B2537] flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#A2782E]" /> Status Availability
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full bg-[#FCFBF9] border border-[#E1DECF] text-[#1B2537] text-xs font-semibold rounded-xl px-3.5 h-11 outline-none focus:border-[#A2782E] focus:bg-white transition cursor-pointer"
              >
                {statusOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === "Active" ? "Active & Redeemable" : "Inactive (Disabled)"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-end items-center gap-3 mt-8 pt-5 border-t border-[#E1DECF]">
            <button
              type="button"
              onClick={() => navigate("/admin/dashboard")}
              className="w-full sm:w-auto px-5 h-11 text-xs font-semibold rounded-lg border border-[#E1DECF] bg-white hover:bg-[#F5F4EF] text-[#4A473D] transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 h-11 bg-[#1B2537] text-[#FFF9EC] hover:bg-[#0F1523] text-xs font-bold rounded-lg transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <Loader2 size={15} className="animate-spin text-[#A2782E]" /> : <Sparkles size={15} className="text-[#A2782E]" />}
              {id ? "Save Coupon Changes" : "Deploy Coupon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCoupon;
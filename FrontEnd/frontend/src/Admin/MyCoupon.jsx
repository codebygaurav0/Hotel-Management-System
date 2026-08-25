import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { signupApi } from "../api";
import useDebounce from "../hooks/useDebounce"; // <-- Apke hooks folder se import kiya gaya hai
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Power,
  PowerOff,
  X,
  TicketPercent,
  Loader2,
} from "lucide-react";

const MyCoupon = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All"); // "All", "Active", "Inactive"

  // Custom hook ka use (Delay aap apne hisaab se set kar sakte hain, jaise 500ms ya default 1000ms)
  const debouncedSearch = useDebounce(search, 500);

  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [showView, setShowView] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${signupApi}coupon/all`, { headers });
      setCoupons(response.data.result || []);
    } catch (error) {
      console.error("Fetch coupons exception:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.patch(
        `${signupApi}coupon/toggle-status/${id}`,
        {},
        { headers },
      );

      const updatedStatus = response.data?.result?.status;

      setCoupons((prev) =>
        prev.map((c) =>
          c._id === id
            ? {
                ...c,
                status:
                  updatedStatus ||
                  (c.status === "Active" ? "Inactive" : "Active"),
              }
            : c,
        ),
      );

      if (selectedCoupon && selectedCoupon._id === id) {
        setSelectedCoupon((prev) => ({
          ...prev,
          status:
            updatedStatus || (prev.status === "Active" ? "Inactive" : "Active"),
        }));
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update coupon status.");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you absolutely sure you want to delete this coupon permanently?",
    );
    if (!confirmDelete) return;

    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${signupApi}coupon/delete/${id}`, { headers });
      alert("Coupon successfully deleted.");
      setCoupons((prev) => prev.filter((c) => c._id !== id));
      if (showView && selectedCoupon?._id === id) {
        setShowView(false);
        setSelectedCoupon(null);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Error executing deletion.");
    }
  };

  const handleView = (coupon) => {
    setSelectedCoupon(coupon);
    setShowView(true);
  };

  const handleEdit = (id) => {
    navigate(`/admin/addCoupon?id=${id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "N/A"
      : date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  const filteredCoupons = useMemo(() => {
    let data = [...coupons];

    if (statusFilter !== "All") {
      data = data.filter((c) => c.status === statusFilter);
    }

    // Debounced search value ka use filtering ke liye
    if (debouncedSearch.trim()) {
      const searchLower = debouncedSearch.toLowerCase();
      data = data.filter((c) =>
        c.couponCode?.toLowerCase().includes(searchLower),
      );
    }

    return data;
  }, [coupons, debouncedSearch, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: coupons.length,
      active: coupons.filter((c) => c.status === "Active").length,
      inactive: coupons.filter((c) => c.status === "Inactive").length,
    };
  }, [coupons]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px] gap-3">
        <Loader2 className="animate-spin text-[#A2782E]" size={32} />
        <h2 className="text-[#8C8676] font-['IBM_Plex_Mono',monospace] text-[12px] uppercase tracking-wider font-semibold">
          Loading Coupons...
        </h2>
      </div>
    );
  }

  return (
    <div className="text-[#232320] font-['Inter',sans-serif]">
      {/* Header controls interface bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:flex-1 max-w-md">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A39C89]"
            size={16}
          />
          <input
            type="text"
            placeholder="Search coupon codes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-[#E1DECF] rounded-lg pl-10 pr-4 h-11 text-[13px] focus:outline-none focus:border-[#A2782E] transition bg-white shadow-sm"
          />
        </div>
        <button
          onClick={() => navigate("/admin/addCoupon")}
          className="w-full sm:w-auto bg-[#1B2537] hover:bg-[#26314A] text-[#FFF9EC] px-6 h-11 rounded-lg font-semibold text-[13px] transition-colors whitespace-nowrap shadow-sm flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          Create Coupon
        </button>
      </div>

      {/* Tabs Switcher Panels Control Layout */}
      <div className="flex border-b border-[#E1DECF] mb-8 overflow-x-auto gap-2 scrollbar-none">
        {["All", "Active", "Inactive"].map((status) => {
          const isActive = statusFilter === status;
          const count =
            status === "All"
              ? stats.total
              : status === "Active"
                ? stats.active
                : stats.inactive;

          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-5 py-3 font-['Space_Grotesk',sans-serif] font-medium text-[14px] rounded-t-lg transition whitespace-nowrap border-b-2 -mb-[1px] ${
                isActive
                  ? "border-[#A2782E] text-[#1B2537] bg-[#FBF6E9] font-bold"
                  : "border-transparent text-[#8C8676] hover:text-[#1B2537] hover:bg-[#F9F8F4]"
              }`}
            >
              {status} Coupons
              <span
                className={`ml-1.5 px-2 py-0.5 rounded-[4px] text-[10px] font-['IBM_Plex_Mono',monospace] font-bold ${
                  isActive
                    ? "bg-[#1B2537] text-[#FFF9EC]"
                    : "bg-[#F5F4EF] text-[#7A7565] border border-[#E1DECF]"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Grid Render Structure */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCoupons.length === 0 && (
          <div className="col-span-full bg-[#FCFBF9] rounded-xl border border-dashed border-[#E1DECF] p-16 text-center">
            <TicketPercent className="mx-auto text-[#D8D1C2] mb-3" size={40} />
            <h3 className="font-['Space_Grotesk',sans-serif] font-bold text-[18px] text-[#1B2537]">
              No discount coupons available
            </h3>
            <p className="text-[#7A7565] text-[13px] mt-1">
              Try adjusting your filters or create a new coupon.
            </p>
          </div>
        )}

        {filteredCoupons.map((coupon) => {
          const isExpired =
            coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
          return (
            <div
              key={coupon._id}
              className="bg-white rounded-xl border border-[#E1DECF] shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              {/* Top Banner Block */}
              <div className="p-6 border-b border-[#E1DECF] bg-[#F9F8F4] relative flex justify-between items-start">
                <div>
                  <span className="font-['IBM_Plex_Mono',monospace] text-[10px] uppercase text-[#A2782E] tracking-wider font-semibold block mb-1">
                    Coupon Code
                  </span>
                  <h2 className="font-['Space_Grotesk',sans-serif] text-[22px] font-bold text-[#1B2537] tracking-wider">
                    {coupon.couponCode}
                  </h2>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span
                    className={`px-2.5 py-1 text-[10px] font-['IBM_Plex_Mono',monospace] font-bold uppercase tracking-wider border rounded-md shadow-sm ${
                      coupon.status === "Active"
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-gray-100 border-gray-200 text-gray-600"
                    }`}
                  >
                    {coupon.status}
                  </span>
                  {isExpired && (
                    <span className="bg-red-50 border border-red-200 text-red-600 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase font-['IBM_Plex_Mono',monospace] shadow-sm">
                      Expired
                    </span>
                  )}
                </div>
              </div>

              {/* Central Details */}
              <div className="p-6 space-y-3.5 text-[13px]">
                <div className="flex justify-between items-center">
                  <span className="text-[#8C8676] font-medium">
                    Discount Type
                  </span>
                  <span className="font-semibold text-[#1B2537]">
                    {coupon.discountType}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#8C8676] font-medium">Value</span>
                  <span className="font-bold text-[#A2782E] text-[15px]">
                    {coupon.discountType === "Percentage"
                      ? `${coupon.discountValue}% Off`
                      : `₹${coupon.discountValue} Flat`}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#8C8676] font-medium">
                    Min. Booking
                  </span>
                  <span className="font-medium text-[#1B2537]">
                    ₹{coupon.minBookingAmount || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#8C8676] font-medium">
                    Valid Until
                  </span>
                  <span className="font-['IBM_Plex_Mono',monospace] text-[12px] font-medium text-[#1B2537]">
                    {formatDate(coupon.expiryDate)}
                  </span>
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="p-4 border-t border-[#E1DECF] bg-white flex items-center gap-2">
                <button
                  onClick={() => handleView(coupon)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-[#1B2537] hover:bg-[#26314A] text-[#FFF9EC] text-[13px] py-2.5 rounded-lg font-semibold transition-colors shadow-sm"
                >
                  <Eye size={14} /> View
                </button>
                <button
                  onClick={() => handleEdit(coupon._id)}
                  className="p-2.5 bg-white hover:bg-[#F9F8F4] border border-[#E1DECF] text-[#4A473D] rounded-lg transition-colors shadow-sm"
                  title="Edit Coupon"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleToggleStatus(coupon._id)}
                  className={`p-2.5 rounded-lg border transition-colors shadow-sm ${
                    coupon.status === "Active"
                      ? "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700"
                      : "bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                  }`}
                  title={
                    coupon.status === "Active"
                      ? "Deactivate Coupon"
                      : "Activate Coupon"
                  }
                >
                  {coupon.status === "Active" ? (
                    <PowerOff size={16} />
                  ) : (
                    <Power size={16} />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(coupon._id)}
                  className="p-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-lg transition-colors shadow-sm"
                  title="Delete Coupon"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* View Details Modal Layer */}
      {showView && selectedCoupon && (
        <div className="fixed inset-0 bg-[#1B2537]/40 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E1DECF] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-[#E1DECF] p-6 sticky top-0 bg-white z-10">
              <div>
                <h2 className="font-['Space_Grotesk',sans-serif] text-[20px] font-bold text-[#1B2537]">
                  Coupon Details
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowView(false);
                  setSelectedCoupon(null);
                }}
                className="text-[#8C8676] hover:text-[#1B2537] bg-[#F5F4EF] hover:bg-[#E1DECF] w-8 h-8 rounded-full flex items-center justify-center transition border border-transparent hover:border-[#D1CEBF]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 text-[13.5px]">
              {/* Grid Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F9F8F4] rounded-lg border border-[#E1DECF] p-4">
                  <p className="font-['IBM_Plex_Mono',monospace] text-[10px] font-semibold text-[#A39C89] uppercase tracking-widest">
                    Coupon Code
                  </p>
                  <h3 className="font-['Space_Grotesk',sans-serif] font-bold text-[#1B2537] text-[18px] tracking-wider mt-1">
                    {selectedCoupon.couponCode}
                  </h3>
                </div>
                <div className="bg-[#F9F8F4] rounded-lg border border-[#E1DECF] p-4">
                  <p className="font-['IBM_Plex_Mono',monospace] text-[10px] font-semibold text-[#A39C89] uppercase tracking-widest">
                    Status
                  </p>
                  <span
                    className={`px-2.5 py-1 text-[10px] font-['IBM_Plex_Mono',monospace] font-bold uppercase tracking-wider border rounded-md mt-1.5 inline-block shadow-sm ${
                      selectedCoupon.status === "Active"
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-gray-100 border-gray-200 text-gray-600"
                    }`}
                  >
                    {selectedCoupon.status}
                  </span>
                </div>
                <div className="bg-[#F9F8F4] rounded-lg border border-[#E1DECF] p-4">
                  <p className="font-['IBM_Plex_Mono',monospace] text-[10px] font-semibold text-[#A39C89] uppercase tracking-widest">
                    Discount Type
                  </p>
                  <h4 className="font-bold text-[#1B2537] mt-1">
                    {selectedCoupon.discountType}
                  </h4>
                </div>
                <div className="bg-[#F9F8F4] rounded-lg border border-[#E1DECF] p-4">
                  <p className="font-['IBM_Plex_Mono',monospace] text-[10px] font-semibold text-[#A39C89] uppercase tracking-widest">
                    Discount Value
                  </p>
                  <h4 className="font-bold text-[#A2782E] text-[16px] mt-1">
                    {selectedCoupon.discountType === "Percentage"
                      ? `${selectedCoupon.discountValue}%`
                      : `₹${selectedCoupon.discountValue}`}
                  </h4>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-4">
                <div className="bg-white border border-[#E1DECF] rounded-lg p-4 flex justify-between items-center shadow-sm">
                  <span className="font-semibold text-[#7A7565]">
                    Minimum Booking Amount
                  </span>
                  <span className="font-bold text-[#1B2537]">
                    ₹{selectedCoupon.minBookingAmount || 0}
                  </span>
                </div>
                <div className="bg-white border border-[#E1DECF] rounded-lg p-4 flex justify-between items-center shadow-sm">
                  <span className="font-semibold text-[#7A7565]">
                    Maximum Uses Allowed
                  </span>
                  <span className="font-bold text-[#1B2537]">
                    {selectedCoupon.maxUses || "Unlimited"}
                  </span>
                </div>
                <div className="bg-white border border-[#E1DECF] rounded-lg p-4 flex justify-between items-center shadow-sm">
                  <span className="font-semibold text-[#7A7565]">
                    Creation Date
                  </span>
                  <span className="font-['IBM_Plex_Mono',monospace] font-medium text-[#1B2537]">
                    {formatDate(selectedCoupon.createdAt)}
                  </span>
                </div>
                <div className="bg-white border border-[#E1DECF] rounded-lg p-4 flex justify-between items-center shadow-sm">
                  <span className="font-semibold text-[#7A7565]">
                    Expiry Date
                  </span>
                  <span className="font-['IBM_Plex_Mono',monospace] font-bold text-red-600">
                    {formatDate(selectedCoupon.expiryDate)}
                  </span>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="mt-8 flex flex-wrap justify-between items-center gap-3 border-t pt-6 border-[#E1DECF]">
                <button
                  onClick={() => handleDelete(selectedCoupon._id)}
                  className="flex items-center gap-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-semibold px-5 py-2.5 text-[13px] rounded-lg transition shadow-sm"
                >
                  <Trash2 size={16} /> Delete Coupon
                </button>

                <button
                  onClick={() => handleToggleStatus(selectedCoupon._id)}
                  className={`flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold rounded-lg border transition shadow-sm ${
                    selectedCoupon.status === "Active"
                      ? "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700"
                      : "bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                  }`}
                >
                  {selectedCoupon.status === "Active" ? (
                    <>
                      <PowerOff size={16} /> Deactivate
                    </>
                  ) : (
                    <>
                      <Power size={16} /> Activate
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCoupon;

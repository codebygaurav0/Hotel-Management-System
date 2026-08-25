import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { signupApi } from "../api";
import { useNavigate } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Toaster, toast } from "sonner";
import {
  Calendar,
  BedDouble,
  Users,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Eye,
  X,
  User,
  CheckSquare,
  ArrowRight,
  Filter
} from "lucide-react";

const HotelBookings = () => {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("current"); // "current", "completed", "cancelled", "all"

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchHotelBookings();
  }, []);

  const fetchHotelBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${signupApi}booking/hotelBookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data.bookings || []);
    } catch (error) {
      console.error("Fetch hotel bookings error:", error);
      toast.error("Failed to load reservations.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Booking Status Actions (Confirm, Check-In, Complete)
  const handleBookingAction = async (bookingId, actionType) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");
      let endpoint = "";

      if (actionType === "confirm") endpoint = `booking/confirm/${bookingId}`;
      if (actionType === "checkin") endpoint = `booking/checkin/${bookingId}`;
      if (actionType === "complete") endpoint = `booking/complete/${bookingId}`;

      const res = await axios.patch(`${signupApi}${endpoint}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(res.data.message || "Status updated successfully.");

      fetchHotelBookings();
      if (selectedBooking && selectedBooking._id === bookingId) {
        setSelectedBooking(res.data.booking);
      }
    } catch (error) {
      console.error("Action Error:", error);
      toast.error(error.response?.data?.message || "Failed to update status.");
    } finally {
      setActionLoading(false);
    }
  };

  // Filter bookings based on active tab
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const status = b.bookingStatus;
      if (activeTab === "current") {
        return ["Pending", "Confirmed", "Checked In"].includes(status);
      }
      if (activeTab === "completed") {
        return status === "Completed";
      }
      if (activeTab === "cancelled") {
        return status === "Cancelled";
      }
      return true; // "all"
    });
  }, [bookings, activeTab]);

  const bookingBadge = (status) => {
    switch (status) {
      case "Confirmed":
        return { bg: "bg-emerald-50 text-emerald-800 border-emerald-200", icon: <CheckCircle2 size={13} className="text-emerald-700" /> };
      case "Checked In":
        return { bg: "bg-[#8c6d53]/20 text-[#634b37] border-[#8c6d53]/40", icon: <CheckSquare size={13} className="text-[#8c6d53]" /> };
      case "Completed":
        return { bg: "bg-amber-50 text-amber-800 border-amber-200", icon: <ShieldCheck size={13} className="text-amber-700" /> };
      case "Cancelled":
        return { bg: "bg-rose-50 text-rose-800 border-rose-200", icon: <XCircle size={13} className="text-rose-700" /> };
      default:
        return { bg: "bg-amber-50/80 text-amber-800 border-amber-200", icon: <Clock size={13} className="text-amber-700" /> };
    }
  };

  const getModalImages = (booking) => {
    if (!booking) return [];
    if (booking.roomId?.roomImages?.length > 0) return booking.roomId.roomImages;
    if (booking.hotelId?.hotelImages?.length > 0) return booking.hotelId.hotelImages;
    return ["https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800"];
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-[#faf7f2] space-y-4">
        <div className="w-10 h-10 border-4 border-[#8c6d53] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#a39382] text-xs font-mono uppercase tracking-widest font-semibold">Loading Property Reservations...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#3d3229] font-sans pb-24 relative max-w-[1600px] mx-auto">
      <Toaster position="top-right" richColors />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Header */}
      <div className="bg-white border-b border-[#e8dfd5] sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-5 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#8c6d53] font-bold uppercase block mb-1">
              Hotel Management Panel
            </span>
            <h1 className="text-2xl font-bold font-['Space_Grotesk',sans-serif] text-[#2c221e] m-0 tracking-tight">
              Property Reservations
            </h1>
          </div>
          <button
            onClick={() => navigate("/hotel/hotelDashboard")}
            className="flex items-center gap-2 bg-[#3d2e24] hover:bg-[#2c221e] text-[#f7f3ed] px-4 py-2.5 rounded-xl transition text-xs font-semibold shadow-sm cursor-pointer"
          >
            <ArrowLeft size={16} /> Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 pt-8">

        {/* 🗂️ TABS FILTER */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-[#e8dfd5] pb-4">
          {[
            { key: "current", label: "Current Bookings", count: bookings.filter(b => ["Pending", "Confirmed", "Checked In"].includes(b.bookingStatus)).length },
            { key: "completed", label: "Completed Stays", count: bookings.filter(b => b.bookingStatus === "Completed").length },
            { key: "cancelled", label: "Cancelled", count: bookings.filter(b => b.bookingStatus === "Cancelled").length },
            { key: "all", label: "All Bookings", count: bookings.length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === tab.key
                  ? "bg-[#3d2e24] text-[#f7f3ed] shadow-sm"
                  : "bg-white text-[#78685a] border border-[#e8dfd5] hover:bg-[#efe8df] hover:text-[#2c221e]"
              }`}
            >
              {tab.label}
              <span className={`px-2 py-0.5 rounded-md text-[10px] ${activeTab === tab.key ? "bg-[#2c221e] text-[#f7f3ed]" : "bg-[#e8dfd5] text-[#78685a]"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-[#e8dfd5] shadow-sm p-16 text-center max-w-lg mx-auto mt-8">
            <div className="w-16 h-16 bg-[#f7f3ed] border border-[#e8dfd5] rounded-2xl flex items-center justify-center mx-auto text-[#a39382] mb-5 shadow-sm">
              <Users size={30} strokeWidth={1.5} />
            </div>
            <h2 className="text-lg font-bold font-['Space_Grotesk',sans-serif] text-[#2c221e] mb-1">No Bookings Found</h2>
            <p className="text-[#78685a] text-xs mb-6 font-medium">There are no bookings under this category right now.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const badgeInfo = bookingBadge(booking.bookingStatus);
              const roomImage = booking.roomId?.roomImages?.[0] || "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=600";

              return (
                <div
                  key={booking._id}
                  className="bg-white rounded-2xl border border-[#e8dfd5] p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row items-center gap-5 group"
                >
                  {/* Room Thumbnail */}
                  <div className="w-full md:w-40 h-32 rounded-xl overflow-hidden bg-[#1c1613] shrink-0 relative border border-[#e8dfd5]">
                    <img
                      src={roomImage}
                      alt="Room"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90 group-hover:opacity-100"
                    />
                  </div>

                  {/* Summary Info */}
                  <div className="flex-1 space-y-2.5 w-full">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <h2 className="text-lg font-bold font-['Space_Grotesk',sans-serif] text-[#2c221e] leading-tight">
                          {booking.userId?.name || "Valued Guest"}
                        </h2>
                        <p className="text-[#78685a] text-xs flex items-center gap-1.5 mt-0.5 font-medium">
                          <User size={12} className="text-[#8c6d53]" /> {booking.userId?.email || "No email provided"}
                        </p>
                      </div>
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border shadow-sm ${badgeInfo.bg}`}>
                        {badgeInfo.icon} {booking.bookingStatus}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-8 gap-y-2 pt-2.5 text-xs border-t border-[#f0e8df]">
                      <div>
                        <span className="text-[#a39382] text-[10px] font-bold uppercase tracking-wider block mb-0.5 font-mono">Room Type</span>
                        <strong className="text-[#2c221e]">{booking.roomId?.roomType || "Suite"}</strong>
                      </div>
                      <div>
                        <span className="text-[#a39382] text-[10px] font-bold uppercase tracking-wider block mb-0.5 font-mono">Stay Dates</span>
                        <strong className="text-[#2c221e]">{new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}</strong>
                      </div>
                      <div>
                        <span className="text-[#a39382] text-[10px] font-bold uppercase tracking-wider block mb-0.5 font-mono">Amount</span>
                        <strong className="text-[#2c221e]">₹{booking.finalAmount?.toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Action Button - Warm Brown Theme */}
                  <div className="w-full md:w-auto flex justify-end shrink-0 border-t md:border-t-0 md:border-l border-[#f0e8df] pt-4 md:pt-0 md:pl-5">
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#3d2e24] hover:bg-[#2c221e] text-[#f7f3ed] px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer"
                    >
                      <Eye size={15} /> View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* 🔍 COMPLETE DETAILS MODAL WITH IMAGE GALLERY */}
      {/* ========================================== */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-[#1c1613]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-[650px] w-full max-h-[90vh] overflow-hidden shadow-2xl border border-[#e8dfd5] flex flex-col relative">

            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-[#f0e8df] p-5 bg-white shrink-0 z-10">
              <div>
                <h2 className="text-lg font-bold font-['Space_Grotesk',sans-serif] text-[#2c221e] leading-none">
                  Reservation #{selectedBooking.bookingId}
                </h2>
                <span className="text-[10px] font-mono tracking-widest text-[#8c6d53] font-bold uppercase block mt-1">
                  Guest Folio & Management
                </span>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-[#a39382] hover:text-[#2c221e] bg-[#f7f3ed] hover:bg-[#efe8df] w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="overflow-y-auto flex-1 bg-white">

              {/* HORIZONTAL SCROLLING IMAGE GALLERY */}
              <div className="relative border-b border-[#e8dfd5] bg-[#1c1613]">
                <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide p-3 gap-3 h-56 sm:h-64">
                  {getModalImages(selectedBooking).map((img, index) => (
                    <div key={index} className="w-full sm:w-[90%] h-full flex-shrink-0 snap-center relative">
                      <img
                        src={img}
                        alt={`Room View ${index + 1}`}
                        className="w-full h-full object-cover rounded-xl shadow-sm border border-white/10"
                      />
                      <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white px-2.5 py-1 rounded-md font-mono text-[10px] font-bold tracking-widest shadow-sm">
                        {index + 1} / {getModalImages(selectedBooking).length}
                      </div>
                    </div>
                  ))}
                </div>
                {getModalImages(selectedBooking).length > 1 && (
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur px-2.5 py-1 rounded-md text-[10px] font-bold text-[#f7f3ed] shadow-sm flex items-center gap-1 border border-white/10">
                    Swipe <ArrowRight size={11} />
                  </div>
                )}
              </div>

              <div className="p-6 space-y-5 text-xs">

                {/* Guest Information */}
                <div className="bg-[#f7f3ed] p-4 rounded-2xl border border-[#e8dfd5]">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#8c6d53] mb-2.5">Guest Information</p>
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <span className="text-[#a39382] text-[10px] font-semibold uppercase tracking-wider block mb-0.5">Full Name</span>
                      <strong className="text-[#2c221e] text-sm">{selectedBooking.userId?.name || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-[#a39382] text-[10px] font-semibold uppercase tracking-wider block mb-0.5">Contact Email</span>
                      <strong className="text-[#2c221e] font-medium">{selectedBooking.userId?.email || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-[#a39382] text-[10px] font-semibold uppercase tracking-wider block mb-0.5">Mobile Number</span>
                      <strong className="text-[#2c221e] font-medium">{selectedBooking.userId?.mobile || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-[#a39382] text-[10px] font-semibold uppercase tracking-wider block mb-0.5">Total Guests</span>
                      <strong className="text-[#2c221e] font-medium">{selectedBooking.totalGuests} Persons</strong>
                    </div>
                  </div>
                </div>

                {/* Room & Schedule */}
                <div className="bg-[#f7f3ed] p-4 rounded-2xl border border-[#e8dfd5]">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#8c6d53] mb-2.5">Room & Schedule</p>
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <span className="text-[#a39382] text-[10px] font-semibold uppercase tracking-wider block mb-0.5">Room Assigned</span>
                      <strong className="text-[#2c221e]">{selectedBooking.roomId?.roomType} <span className="text-[#8c6d53]">(#{selectedBooking.roomId?.roomNumber})</span></strong>
                    </div>
                    <div>
                      <span className="text-[#a39382] text-[10px] font-semibold uppercase tracking-wider block mb-0.5">Booking Status</span>
                      <strong className="text-emerald-800">{selectedBooking.bookingStatus}</strong>
                    </div>
                    <div>
                      <span className="text-[#a39382] text-[10px] font-semibold uppercase tracking-wider block mb-0.5">Check-In</span>
                      <strong className="text-[#2c221e] font-mono">{new Date(selectedBooking.checkIn).toLocaleDateString()}</strong>
                    </div>
                    <div>
                      <span className="text-[#a39382] text-[10px] font-semibold uppercase tracking-wider block mb-0.5">Check-Out</span>
                      <strong className="text-[#2c221e] font-mono">{new Date(selectedBooking.checkOut).toLocaleDateString()}</strong>
                    </div>
                  </div>
                </div>

                {selectedBooking.specialRequest && (
                  <div className="bg-amber-50/80 border border-amber-200 p-3.5 rounded-2xl shadow-sm">
                    <p className="text-[10px] font-mono font-bold text-amber-800 uppercase tracking-widest mb-1">Guest Special Request</p>
                    <p className="text-xs text-amber-900 font-medium italic">"{selectedBooking.specialRequest}"</p>
                  </div>
                )}

                {/* Revenue Card */}
                <div className="bg-[#2c221e] text-[#f7f3ed] p-5 rounded-2xl flex justify-between items-center shadow-sm border border-[#8c6d53]/30">
                  <div>
                    <p className="text-[10px] text-[#d4c5b9] font-mono font-semibold uppercase tracking-widest mb-0.5">Payment: {selectedBooking.paymentStatus}</p>
                    <p className="text-xs font-medium">Duration: <span className="font-bold">{selectedBooking.totalNights} Nights</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-[#d4c5b9] font-mono font-semibold uppercase tracking-widest mb-0.5">Total Revenue</p>
                    <h3 className="text-2xl font-bold font-['Space_Grotesk',sans-serif] text-[#e5a970] leading-none">₹{selectedBooking.finalAmount?.toLocaleString()}</h3>
                  </div>
                </div>

                {/* BOOKING MANAGEMENT ACTIONS */}
                <div className="pt-3 border-t border-[#f0e8df] flex flex-wrap gap-3 justify-between items-center">
                  <span className="text-[11px] font-bold text-[#78685a] uppercase tracking-wider">Update Status:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedBooking.bookingStatus === "Pending" && (
                      <button
                        disabled={actionLoading}
                        onClick={() => handleBookingAction(selectedBooking._id, "confirm")}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer"
                      >
                        Confirm Booking
                      </button>
                    )}
                    {selectedBooking.bookingStatus === "Confirmed" && (
                      <button
                        disabled={actionLoading}
                        onClick={() => handleBookingAction(selectedBooking._id, "checkin")}
                        className="bg-[#8c6d53] hover:bg-[#634b37] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer"
                      >
                        Check-In Guest
                      </button>
                    )}
                    {selectedBooking.bookingStatus === "Checked In" && (
                      <button
                        disabled={actionLoading}
                        onClick={() => handleBookingAction(selectedBooking._id, "complete")}
                        className="bg-[#3d2e24] hover:bg-[#2c221e] text-[#f7f3ed] px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer"
                      >
                        Complete Stay
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#f0e8df] bg-[#f7f3ed]/60 shrink-0 flex justify-end">
              <button
                onClick={() => setSelectedBooking(null)}
                className="bg-[#3d2e24] hover:bg-[#2c221e] text-[#f7f3ed] px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-sm cursor-pointer"
              >
                Close Folio
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default HotelBookings;
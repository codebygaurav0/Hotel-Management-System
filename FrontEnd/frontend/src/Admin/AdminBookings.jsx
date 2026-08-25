import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { signupApi } from "../api";
import Swal from "sweetalert2";
import {
  Calendar,
  BedDouble,
  Users,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Eye,
  X,
  User,
  Search,
  CheckSquare,
  Building2,
  Mail,
  TrendingUp,
  Hotel,
  ArrowUpDown,
} from "lucide-react";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true); // Full screen loading ke liye

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [hotelFilter, setHotelFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Sorting State
  const [sortBy, setSortBy] = useState("newest");

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const token = localStorage.getItem("token");

  // ==========================================================
  // FETCH BOOKINGS (Integrated with Backend Params)
  // ==========================================================
  const fetchBookings = async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) setLoading(true);

      // Frontend sort options ko Backend format me map karna
      let sortField = "createdAt";
      let sortOrder = "desc";

      if (sortBy === "oldest") {
        sortField = "createdAt";
        sortOrder = "asc";
      } else if (sortBy === "priceHigh") {
        sortField = "finalAmount";
        sortOrder = "desc";
      } else if (sortBy === "priceLow") {
        sortField = "finalAmount";
        sortOrder = "asc";
      }

      const res = await axios.get(`${signupApi}booking/hotelBookings`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search: searchQuery,
          status: statusFilter,
          sortBy: sortField,
          order: sortOrder,
        },
      });

      if (res.data?.success) {
        setBookings(res.data.bookings || []);
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.response?.data?.message || "Unable to fetch bookings.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial Load par fetch karna
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchBookings(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Jab bhi filter ya search change ho toh API call karna (Debounce ke sath)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBookings(false); // background fetch (no full screen loading)
    }, 500); // 500ms ka delay typing ke baad

    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter, sortBy]);

  // ==========================================================
  // ACTION HANDLERS (Confirm, Check-In, Complete)
  // ==========================================================
  const handleBookingAction = async (id, actionType) => {
    try {
      setActionLoading(true);
      let endpoint = "";
      if (actionType === "confirm") endpoint = `booking/confirm/${id}`;
      if (actionType === "checkin") endpoint = `booking/checkin/${id}`;
      if (actionType === "complete") endpoint = `booking/complete/${id}`;

      const res = await axios.patch(
        `${signupApi}${endpoint}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      Swal.fire({
        icon: "success",
        title: "Success",
        text: res.data?.message || "Status updated successfully.",
        timer: 1500,
        showConfirmButton: false,
      });

      // Background refresh without loading screen
      await fetchBookings(false);

      if (selectedBooking && selectedBooking._id === id && res.data?.booking) {
        setSelectedBooking(res.data.booking);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.response?.data?.message || "Something went wrong.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================================
  // HOTEL LIST FOR DROPDOWN FILTER
  // ==========================================================
  const hotels = useMemo(() => {
    return [
      ...new Set(
        bookings.map((item) => item.hotelId?.hotelName).filter(Boolean),
      ),
    ];
  }, [bookings]);

  // ==========================================================
  // FILTER BOOKINGS (Frontend Fallback for Hotel Filter)
  // ==========================================================
  const filteredBookings = useMemo(() => {
    let result = bookings;

    // Sirf Hotel filtering frontend pe rakha hai taki dropdown options break na ho
    if (hotelFilter) {
      result = result.filter(
        (booking) => booking.hotelId?.hotelName === hotelFilter,
      );
    }

    return result;
  }, [bookings, hotelFilter]);

  // Dashboard Stats Calculations
  const stats = useMemo(() => {
    const totalRevenue = bookings.reduce(
      (acc, curr) => acc + (curr.finalAmount || 0),
      0,
    );
    const pendingCount = bookings.filter(
      (b) => b.bookingStatus === "Pending",
    ).length;
    const checkedInCount = bookings.filter(
      (b) => b.bookingStatus === "Checked In",
    ).length;

    return {
      total: bookings.length,
      revenue: totalRevenue,
      pending: pendingCount,
      checkedIn: checkedInCount,
    };
  }, [bookings]);

  // Status Badge Mapper
  const bookingBadge = (status) => {
    switch (status) {
      case "Confirmed":
        return {
          bg: "bg-emerald-100/70 text-emerald-800 border-emerald-300",
          icon: <CheckCircle2 size={13} className="text-emerald-600" />,
        };
      case "Checked In":
        return {
          bg: "bg-indigo-100/70 text-indigo-800 border-indigo-300",
          icon: <CheckSquare size={13} className="text-indigo-600" />,
        };
      case "Completed":
        return {
          bg: "bg-blue-100/70 text-blue-800 border-blue-300",
          icon: <ShieldCheck size={13} className="text-blue-600" />,
        };
      case "Cancelled":
        return {
          bg: "bg-rose-100/70 text-rose-800 border-rose-300",
          icon: <XCircle size={13} className="text-rose-600" />,
        };
      default:
        return {
          bg: "bg-amber-100/70 text-amber-800 border-amber-300",
          icon: <Clock size={13} className="text-amber-600" />,
        };
    }
  };

  // Get Images for Modal Gallery
  const getModalImages = (booking) => {
    if (!booking) return [];
    if (booking.roomId?.roomImages?.length > 0)
      return booking.roomId.roomImages;
    if (booking.hotelId?.hotelImages?.length > 0)
      return booking.hotelId.hotelImages;
    return [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800",
    ];
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-[#f8fafc] space-y-4">
        <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-xs font-mono uppercase tracking-widest font-semibold">
          Loading Reservations Dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased pb-20 relative">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <span className="text-[11px] font-mono tracking-widest text-amber-600 font-bold uppercase block mb-0.5">
                Admin Panel
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Reservation Management
              </h1>
            </div>

            {/* Filters & Search & Sorting Toolbar */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative flex-1 sm:w-60">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={15}
                />
                <input
                  type="text"
                  placeholder="Search guest or booking ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 h-10 rounded-lg text-xs font-medium focus:bg-white focus:border-slate-800 outline-none transition"
                />
              </div>

              {/* Hotel Filter */}
              <select
                value={hotelFilter}
                onChange={(e) => setHotelFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 px-3 h-10 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-slate-800 transition cursor-pointer"
              >
                <option value="">All Hotels</option>
                {hotels.map((hotel, index) => (
                  <option key={index} value={hotel}>
                    {hotel}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 px-3 h-10 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-slate-800 transition cursor-pointer"
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Checked In">Checked In</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              {/* Sorting Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 px-3 h-10 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-slate-800 transition cursor-pointer"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
                <option value="priceHigh">Price: High to Low</option>
                <option value="priceLow">Price: Low to High</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* KPI Dashboard Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-4">
            <div className="p-3 bg-slate-100 rounded-lg text-slate-700">
              <Hotel size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total Bookings
              </p>
              <h3 className="text-xl font-extrabold text-slate-900">
                {stats.total}
              </h3>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-4">
            <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Pending
              </p>
              <h3 className="text-xl font-extrabold text-amber-600">
                {stats.pending}
              </h3>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-4">
            <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
              <CheckSquare size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Checked-In
              </p>
              <h3 className="text-xl font-extrabold text-indigo-600">
                {stats.checkedIn}
              </h3>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total Revenue
              </p>
              <h3 className="text-xl font-extrabold text-emerald-700">
                ₹{stats.revenue.toLocaleString()}
              </h3>
            </div>
          </div>
        </div>

        {/* Bookings List Area */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center my-6">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-4">
              <Users size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              No Reservations Found
            </h3>
            <p className="text-slate-500 text-xs mt-1">
              Try adjusting your search criteria or clear status/sorting
              filters.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Showing {filteredBookings.length} Reservations
              </p>
            </div>

            {filteredBookings.map((booking) => {
              const badge = bookingBadge(booking.bookingStatus);
              const hotelImage =
                booking.hotelId?.hotelImages?.[0] ||
                booking.roomId?.roomImages?.[0] ||
                "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=600";

              return (
                <div
                  key={booking._id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col md:flex-row items-stretch gap-5"
                >
                  {/* Hotel Visual Thumbnail */}
                  <div className="w-full md:w-52 h-40 md:h-auto rounded-lg overflow-hidden bg-slate-100 shrink-0 relative border border-slate-200">
                    <img
                      src={hotelImage}
                      alt="Property"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3">
                      <p className="text-white text-xs font-bold truncate flex items-center gap-1.5">
                        <Building2 size={13} className="text-amber-400" />
                        {booking.hotelId?.hotelName || "Luxury Hotel"}
                      </p>
                    </div>
                  </div>

                  {/* Booking Main Info */}
                  <div className="flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                        <div>
                          <h2 className="text-lg font-extrabold text-slate-900 leading-tight">
                            {booking.userId?.name || "Valued Guest"}
                          </h2>
                          <p className="text-slate-500 text-xs flex items-center gap-1.5 mt-0.5">
                            <User size={12} className="text-slate-400" />
                            {booking.userId?.email || "No email provided"}
                          </p>
                        </div>
                        <span
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${badge.bg}`}
                        >
                          {badge.icon} {booking.bookingStatus}
                        </span>
                      </div>

                      {/* Detail Metrics Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs border-t border-slate-100">
                        <div>
                          <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                            Room Type
                          </span>
                          <span className="font-bold text-slate-800">
                            {booking.roomId?.roomType || "Standard"}{" "}
                            <span className="text-amber-600 font-mono">
                              (#{booking.roomId?.roomNumber || "N/A"})
                            </span>
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                            Check-In / Out
                          </span>
                          <span className="font-bold text-slate-800 font-mono text-[11px]">
                            {booking.checkIn
                              ? new Date(booking.checkIn).toLocaleDateString()
                              : "N/A"}{" "}
                            -{" "}
                            {booking.checkOut
                              ? new Date(booking.checkOut).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                            Guests
                          </span>
                          <span className="font-bold text-slate-800">
                            {booking.totalGuests || 1} Guests
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                            Total Price
                          </span>
                          <span className="font-extrabold text-slate-900 text-sm">
                            ₹{booking.finalAmount?.toLocaleString() || "0"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() =>
                            handleBookingAction(booking._id, "confirm")
                          }
                          disabled={
                            booking.bookingStatus !== "Pending" || actionLoading
                          }
                          className="flex-1 sm:flex-none px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white rounded-md text-xs font-bold transition shadow-xs cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() =>
                            handleBookingAction(booking._id, "checkin")
                          }
                          disabled={
                            booking.bookingStatus !== "Confirmed" ||
                            actionLoading
                          }
                          className="flex-1 sm:flex-none px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-md text-xs font-bold transition shadow-xs cursor-pointer"
                        >
                          Check-In
                        </button>
                        <button
                          onClick={() =>
                            handleBookingAction(booking._id, "complete")
                          }
                          disabled={
                            booking.bookingStatus !== "Checked In" ||
                            actionLoading
                          }
                          className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 text-white rounded-md text-xs font-bold transition shadow-xs cursor-pointer"
                        >
                          Complete
                        </button>
                      </div>

                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-2 rounded-md text-xs font-bold transition cursor-pointer"
                      >
                        <Eye size={14} className="text-slate-600" /> View Folio
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* View Folio Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col relative">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-200 p-5 bg-white shrink-0">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Reservation Details
                </h3>
                <p className="font-mono text-[11px] text-amber-600 font-semibold tracking-wider uppercase mt-0.5">
                  ID: {selectedBooking.bookingId}
                </p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              {/* Photo Carousel */}
              <div className="flex overflow-x-auto snap-x scrollbar-hide bg-slate-100 p-3 gap-3 rounded-xl border border-slate-200">
                {getModalImages(selectedBooking).map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Room View ${index + 1}`}
                    className="w-full sm:w-80 h-48 object-cover rounded-lg flex-shrink-0 snap-center shadow-xs border border-slate-200"
                  />
                ))}
              </div>

              {/* Information Blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Property Details */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Property Info
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {selectedBooking.hotelId?.hotelName || "N/A"}
                    </h4>
                    <p className="text-slate-500 text-xs flex items-center gap-1 mt-1">
                      <Mail size={12} />{" "}
                      {selectedBooking.hotelId?.hotelEmail || "N/A"}
                    </p>
                    <p className="text-slate-500 text-xs flex items-start gap-1 mt-1">
                      <MapPin size={12} className="shrink-0 mt-0.5" />
                      {selectedBooking.hotelId?.address || "Location Verified"}
                    </p>
                  </div>
                </div>

                {/* Guest Details */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Guest Info
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {selectedBooking.userId?.name || "N/A"}
                    </h4>
                    <p className="text-slate-500 text-xs mt-1">
                      {selectedBooking.userId?.email || "N/A"}
                    </p>
                    <p className="text-slate-500 text-xs mt-1 font-mono">
                      Mobile: {selectedBooking.userId?.mobile || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Special Request */}
              {selectedBooking.specialRequest && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
                    Special Request
                  </span>
                  <p className="text-xs text-amber-900 italic">
                    "{selectedBooking.specialRequest}"
                  </p>
                </div>
              )}

              {/* Billing Summary */}
              <div className="bg-slate-900 text-white p-5 rounded-xl flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-400 font-mono uppercase">
                    Duration: {selectedBooking.totalNights || 1} Nights
                  </p>
                  <p className="text-xs text-slate-300 font-medium mt-1">
                    Status:{" "}
                    <span className="text-amber-400 font-bold">
                      {selectedBooking.bookingStatus}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">
                    Final Amount
                  </span>
                  <span className="text-2xl font-extrabold text-amber-400">
                    ₹{selectedBooking.finalAmount?.toLocaleString() || "0"}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 shrink-0 flex justify-end">
              <button
                onClick={() => setSelectedBooking(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { signupApi } from "../api";
import useDebounce from "../hooks/useDebounce";

import {
  Search,
  Eye,
  Trash2,
  Power,
  PowerOff,
  Edit2,
  Users,
  BedDouble,
  Loader2,
  Hotel,
  X,
  ArrowRight,
  Plus,
  Sparkles,
  Layers,
  Check,
  ArrowUpDown, // Sorting icon ke liye
} from "lucide-react";
import { Toaster, toast } from "sonner";

const AllRooms = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState([]);

  // Search State
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 1000);

  // Sorting State
  const [sortBy, setSortBy] = useState("default"); // 'price-low-high', 'price-high-low', 'room-asc'

  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${signupApi}room/myRooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(response.data.rooms || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch room inventory.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await axios.patch(
        `${signupApi}room/status/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setRooms((prev) =>
        prev.map((r) => (r._id === id ? { ...r, isActive: !r.isActive } : r)),
      );

      if (selectedRoom && selectedRoom._id === id) {
        setSelectedRoom((prev) => ({ ...prev, isActive: !prev.isActive }));
      }
      toast.success("Room status updated successfully.");
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you absolutely sure you want to permanently delete this room configuration?",
      )
    )
      return;
    try {
      await axios.delete(`${signupApi}room/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms((prev) => prev.filter((r) => r._id !== id));
      if (selectedRoom?._id === id) setSelectedRoom(null);
      toast.success("Room deleted successfully.");
    } catch {
      toast.error("Delete failed. Please try again.");
    }
  };

  const filteredRooms = useMemo(() => {
    let data = [...rooms];

    // Status Filter
    if (statusFilter === "Active") data = data.filter((r) => r.isActive);
    if (statusFilter === "Inactive") data = data.filter((r) => !r.isActive);

    // Debounced Search Filter
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      data = data.filter(
        (r) =>
          r.roomNumber.toString().toLowerCase().includes(q) ||
          r.roomType.toLowerCase().includes(q),
      );
    }

    // Sorting Logic Added Here
    if (sortBy === "price-low-high") {
      data.sort((a, b) => a.pricePerNight - b.pricePerNight);
    } else if (sortBy === "price-high-low") {
      data.sort((b, a) => a.pricePerNight - b.pricePerNight); // Fixed high to low
    } else if (sortBy === "room-asc") {
      data.sort((a, b) =>
        a.roomNumber
          .toString()
          .localeCompare(b.roomNumber.toString(), undefined, { numeric: true }),
      );
    }

    return data;
  }, [rooms, debouncedSearch, statusFilter, sortBy]);

  const stats = {
    total: rooms.length,
    active: rooms.filter((r) => r.isActive).length,
    inactive: rooms.filter((r) => !r.isActive).length,
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center gap-3 bg-[#faf7f2]">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-[#8c6d53]/10 flex items-center justify-center">
            <Loader2 className="animate-spin text-[#8c6d53]" size={24} />
          </div>
        </div>
        <p className="text-[#a39382] font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-widest font-semibold">
          Loading Room Inventory...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] font-['Inter',sans-serif] text-[#3d3229] pb-16">
      <Toaster position="top-right" richColors />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600;700&display=swap');
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="max-w-[1550px] mx-auto px-4 sm:px-6 pt-6">
        {/* Header Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-['IBM_Plex_Mono',monospace] uppercase tracking-widest text-[#8c6d53] font-bold bg-[#8c6d53]/10 border border-[#8c6d53]/20 px-2.5 py-0.5 rounded-md">
                Management System
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] text-[#2c221e] tracking-tight">
              Room Inventory
            </h1>
            <p className="text-xs text-[#78685a] font-medium mt-0.5">
              Manage room availability, pricing, amenities, and configurations.
            </p>
          </div>

          <button
            onClick={() => navigate("/hotel/room")}
            className="inline-flex items-center justify-center gap-2 bg-[#3d2e24] hover:bg-[#2c221e] text-[#f7f3ed] px-5 h-11 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer shrink-0"
          >
            <Plus size={16} /> Add New Room
          </button>
        </div>

        {/* Dashboard Metrics Bar */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="bg-white border border-[#e8dfd5] rounded-2xl p-3.5 sm:p-4 shadow-2xs">
            <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold uppercase tracking-wider text-[#a39382]">
              Total Units
            </p>
            <p className="font-['Space_Grotesk'] text-xl sm:text-2xl font-bold text-[#2c221e] mt-0.5">
              {stats.total}
            </p>
          </div>
          <div className="bg-white border border-[#e8dfd5] rounded-2xl p-3.5 sm:p-4 shadow-2xs">
            <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold uppercase tracking-wider text-[#2e6844]">
              Active Units
            </p>
            <p className="font-['Space_Grotesk'] text-xl sm:text-2xl font-bold text-[#2e6844] mt-0.5">
              {stats.active}
            </p>
          </div>
          <div className="bg-white border border-[#e8dfd5] rounded-2xl p-3.5 sm:p-4 shadow-2xs">
            <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold uppercase tracking-wider text-[#9e3a34]">
              Inactive Units
            </p>
            <p className="font-['Space_Grotesk'] text-xl sm:text-2xl font-bold text-[#9e3a34] mt-0.5">
              {stats.inactive}
            </p>
          </div>
        </div>

        {/* Filter Controls Bar with Sorting Added */}
        <div className="bg-white border border-[#e8dfd5] rounded-2xl p-3 sm:p-4 shadow-2xs mb-8 flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Status Tabs */}
          <div className="flex border border-[#f0e8df] bg-[#f7f3ed] p-1 rounded-xl w-full md:w-auto overflow-x-auto scrollbar-none">
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
                  className={`flex items-center gap-2 px-4 py-2 font-['Space_Grotesk'] font-semibold text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-white text-[#2c221e] shadow-2xs border border-[#e8dfd5] font-bold"
                      : "text-[#78685a] hover:text-[#2c221e] hover:bg-[#efe8df]"
                  }`}
                >
                  {status}
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-['IBM_Plex_Mono'] font-bold ${
                      isActive
                        ? "bg-[#8c6d53]/15 text-[#634b37]"
                        : "bg-[#e8dfd5] text-[#78685a]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right side controls: Sorting Dropdown & Search Box */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Sorting Dropdown */}
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a39382] pointer-events-none">
                <ArrowUpDown size={14} />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto bg-[#f7f3ed]/60 border border-[#e8dfd5] rounded-xl pl-9 pr-8 h-10 text-xs font-medium text-[#2c221e] focus:bg-white focus:outline-none focus:border-[#8c6d53] focus:ring-2 focus:ring-[#8c6d53]/15 transition shadow-2xs cursor-pointer appearance-none"
              >
                <option value="default">Sort By: Default</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="room-asc">Room Number: Ascending</option>
              </select>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-80">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a39382]"
                size={15}
              />
              <input
                type="text"
                placeholder="Search by room no. or type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#f7f3ed]/60 border border-[#e8dfd5] rounded-xl pl-10 pr-4 h-10 text-xs font-medium text-[#2c221e] placeholder-[#a39382] focus:bg-white focus:outline-none focus:border-[#8c6d53] focus:ring-2 focus:ring-[#8c6d53]/15 transition shadow-2xs"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a39382] hover:text-[#2c221e] cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Room Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRooms.length === 0 && (
            <div className="col-span-full bg-white rounded-3xl border border-dashed border-[#e8dfd5] p-16 text-center shadow-2xs">
              <div className="w-14 h-14 rounded-2xl bg-[#f7f3ed] text-[#a39382] flex items-center justify-center mx-auto mb-3 border border-[#e8dfd5]">
                <Hotel size={28} />
              </div>
              <h3 className="font-['Space_Grotesk'] font-bold text-base text-[#2c221e]">
                No Room Configurations Found
              </h3>
              <p className="text-[#78685a] text-xs mt-1 max-w-sm mx-auto font-medium">
                Try adjusting your search criteria or filter options to locate
                your room listing.
              </p>
            </div>
          )}

          {filteredRooms.map((room) => (
            <div
              key={room._id}
              className="bg-white rounded-2xl border border-[#e8dfd5] shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group"
            >
              {/* Image Header */}
              <div className="relative h-52 w-full bg-[#1c1613] overflow-hidden shrink-0">
                <img
                  src={
                    room.roomImages?.[0] ||
                    "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop"
                  }
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                  alt={`Room ${room.roomNumber}`}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none"></div>

                {/* Price Tag */}
                <div className="absolute top-3 left-3 bg-[#2c221e]/90 backdrop-blur-md text-[#f7f3ed] px-3 py-1 rounded-xl font-['Space_Grotesk'] text-xs font-bold tracking-wide border border-[#8c6d53]/30 shadow-sm flex items-center gap-1">
                  ₹{room.pricePerNight}
                  <span className="text-[10px] font-normal text-[#d4c5b9] uppercase tracking-wider">
                    / night
                  </span>
                </div>

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2.5 py-1 rounded-xl font-['IBM_Plex_Mono'] text-[10px] font-bold tracking-wider uppercase shadow-sm border backdrop-blur-md ${
                      room.isActive
                        ? "bg-[#2e6844]/90 text-white border-emerald-400/30"
                        : "bg-[#9e3a34]/90 text-white border-rose-400/30"
                    }`}
                  >
                    {room.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Badges Footer inside Image */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  {room.isFeatured ? (
                    <div className="bg-[#8c6d53] text-white px-2.5 py-1 rounded-lg font-['IBM_Plex_Mono'] text-[10px] font-bold uppercase tracking-widest shadow-2xs flex items-center gap-1">
                      <Sparkles size={11} /> Featured
                    </div>
                  ) : (
                    <div></div>
                  )}

                  {room.roomImages?.length > 0 && (
                    <div className="bg-black/60 text-[#f7f3ed] px-2.5 py-1 rounded-lg text-[10px] font-bold backdrop-blur-md flex items-center gap-1 shadow-2xs border border-white/10 font-['IBM_Plex_Mono']">
                      <Layers size={11} /> {room.roomImages.length} Photos
                    </div>
                  )}
                </div>
              </div>

              {/* Room Details */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h2 className="font-['Space_Grotesk'] text-lg font-bold text-[#2c221e] leading-tight">
                      Unit No. {room.roomNumber}
                    </h2>
                  </div>
                  <p className="text-[#8c6d53] font-['IBM_Plex_Mono'] text-[10px] font-bold tracking-widest uppercase mb-3.5">
                    {room.roomType}
                  </p>

                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 border-y border-[#f0e8df] py-3.5 my-2 text-xs">
                    <div className="flex items-center gap-2 text-[#78685a] font-medium">
                      <Users size={15} className="text-[#a39382] shrink-0" />
                      <span>{room.maxOccupancy} Guests Max</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#78685a] font-medium">
                      <BedDouble
                        size={15}
                        className="text-[#a39382] shrink-0"
                      />
                      <span className="truncate">
                        {room.totalBeds} {room.bedType}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons Bar */}
                <div className="grid grid-cols-4 gap-2 mt-4">
                  <button
                    onClick={() => setSelectedRoom(room)}
                    className="col-span-1 bg-[#3d2e24] hover:bg-[#2c221e] text-[#f7f3ed] py-2.5 rounded-xl flex items-center justify-center transition shadow-2xs cursor-pointer"
                    title="View Room Details"
                  >
                    <Eye size={15} />
                  </button>

                  <button
                    onClick={() => navigate(`/hotel/room?edit=${room._id}`)}
                    className="col-span-1 bg-[#f7f3ed] hover:bg-[#efe8df] text-[#3d2e24] border border-[#e8dfd5] py-2.5 rounded-xl flex items-center justify-center transition shadow-2xs cursor-pointer"
                    title="Edit Configuration"
                  >
                    <Edit2 size={15} />
                  </button>

                  <button
                    onClick={() => handleToggleStatus(room._id)}
                    className={`col-span-1 py-2.5 rounded-xl flex items-center justify-center transition shadow-2xs border cursor-pointer ${
                      room.isActive
                        ? "bg-amber-50 hover:bg-amber-100 border-amber-200/80 text-amber-800"
                        : "bg-emerald-50 hover:bg-emerald-100 border-emerald-200/80 text-emerald-800"
                    }`}
                    title={room.isActive ? "Deactivate Room" : "Activate Room"}
                  >
                    {room.isActive ? (
                      <PowerOff size={15} />
                    ) : (
                      <Power size={15} />
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(room._id)}
                    className="col-span-1 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 text-rose-700 py-2.5 rounded-xl flex items-center justify-center transition shadow-2xs cursor-pointer"
                    title="Delete Room"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* VIEW DETAILS MODAL WITH GALLERY */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-[#1c1613]/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-[#e8dfd5] flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-[#f0e8df] px-6 py-4 bg-white shrink-0">
              <div>
                <h2 className="font-['Space_Grotesk'] text-lg font-bold text-[#2c221e] leading-none">
                  Unit {selectedRoom.roomNumber}
                </h2>
                <p className="font-['IBM_Plex_Mono'] text-[10px] text-[#8c6d53] mt-1 tracking-widest font-bold uppercase">
                  {selectedRoom.roomType} Configuration
                </p>
              </div>
              <button
                onClick={() => setSelectedRoom(null)}
                className="text-[#a39382] hover:text-[#2c221e] bg-[#f7f3ed] hover:bg-[#efe8df] w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Body Content */}
            <div className="overflow-y-auto flex-1">
              <div className="relative bg-[#1c1613] border-b border-[#e8dfd5]">
                <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none p-4 gap-3 h-64">
                  {selectedRoom.roomImages?.map((img, index) => (
                    <div
                      key={index}
                      className="w-full sm:w-[90%] h-full flex-shrink-0 snap-center relative rounded-2xl overflow-hidden border border-white/10"
                    >
                      <img
                        src={img}
                        alt={`Room View ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white px-2.5 py-1 rounded-lg font-['IBM_Plex_Mono'] text-[10px] font-bold tracking-widest border border-white/10">
                        {index + 1} / {selectedRoom.roomImages.length}
                      </div>
                    </div>
                  ))}
                </div>

                {selectedRoom.roomImages?.length > 1 && (
                  <div className="absolute top-4 right-4 bg-black/60 text-[#f7f3ed] backdrop-blur px-2.5 py-1 rounded-lg text-[10px] font-bold border border-white/10 shadow-sm flex items-center gap-1 font-['IBM_Plex_Mono']">
                    Swipe <ArrowRight size={11} />
                  </div>
                )}
              </div>

              <div className="p-6 space-y-6 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#f7f3ed] rounded-2xl border border-[#e8dfd5] p-3.5">
                    <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-[#a39382] uppercase tracking-widest mb-1">
                      Rate / Night
                    </p>
                    <h3 className="font-bold text-[#8c6d53] text-sm tracking-wide mt-0.5">
                      ₹{selectedRoom.pricePerNight}
                    </h3>
                  </div>

                  <div className="bg-[#f7f3ed] rounded-2xl border border-[#e8dfd5] p-3.5">
                    <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-[#a39382] uppercase tracking-widest mb-1">
                      Max Guests
                    </p>
                    <h3 className="font-bold text-[#2c221e] text-xs mt-0.5">
                      {selectedRoom.maxOccupancy} Guests
                    </h3>
                  </div>

                  <div className="bg-[#f7f3ed] rounded-2xl border border-[#e8dfd5] p-3.5">
                    <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-[#a39382] uppercase tracking-widest mb-1">
                      Bed Layout
                    </p>
                    <h3 className="font-bold text-[#2c221e] text-xs mt-0.5 truncate">
                      {selectedRoom.totalBeds} {selectedRoom.bedType}
                    </h3>
                  </div>

                  <div className="bg-[#f7f3ed] rounded-2xl border border-[#e8dfd5] p-3.5">
                    <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-[#a39382] uppercase tracking-widest mb-1">
                      Current Status
                    </p>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-['IBM_Plex_Mono'] font-bold uppercase tracking-wider border rounded-md mt-0.5 inline-block ${
                        selectedRoom.isActive
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                          : "bg-rose-50 border-rose-200 text-rose-800"
                      }`}
                    >
                      {selectedRoom.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                {selectedRoom.roomAmenities?.length > 0 && (
                  <div>
                    <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-[#a39382] uppercase tracking-wider mb-2.5">
                      Included Amenities
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedRoom.roomAmenities.map((amenity) => (
                        <span
                          key={amenity}
                          className="bg-[#f7f3ed] text-[#3d2e24] text-xs px-3 py-1.5 rounded-xl border border-[#e8dfd5] font-semibold shadow-2xs flex items-center gap-1.5"
                        >
                          <Check size={12} className="text-[#8c6d53]" />
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-[#a39382] uppercase tracking-wider mb-1.5">
                    Room Specification / Notes
                  </p>
                  <p className="leading-relaxed text-[#5c4d41] bg-[#f7f3ed] p-4 rounded-2xl border border-[#e8dfd5] text-xs font-medium">
                    {selectedRoom.description ||
                      "No specific description available for this room."}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-[#f0e8df] bg-[#f7f3ed]/60 shrink-0 flex flex-wrap justify-between items-center gap-3">
              <button
                onClick={() => handleDelete(selectedRoom._id)}
                className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold px-4 py-2 text-xs rounded-xl transition shadow-2xs cursor-pointer"
              >
                <Trash2 size={14} /> Delete Unit
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => handleToggleStatus(selectedRoom._id)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border transition shadow-2xs cursor-pointer ${
                    selectedRoom.isActive
                      ? "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800"
                      : "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800"
                  }`}
                >
                  {selectedRoom.isActive ? (
                    <>
                      <PowerOff size={14} /> Deactivate
                    </>
                  ) : (
                    <>
                      <Power size={14} /> Activate
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    navigate(`/hotel/room?edit=${selectedRoom._id}`);
                    setSelectedRoom(null);
                  }}
                  className="bg-[#3d2e24] hover:bg-[#2c221e] text-[#f7f3ed] text-xs px-5 py-2 rounded-xl font-bold transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit2 size={13} /> Edit Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllRooms;

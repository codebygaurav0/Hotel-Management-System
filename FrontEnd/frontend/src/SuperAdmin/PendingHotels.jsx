import React, { useEffect, useState } from "react";
import axios from "axios";
import { signupApi } from "../api";
import {
  Loader2,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from "lucide-react";
import useDebounce from "../hooks/useDebounce"; // Aapka custom hook

const PendingHotels = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingHotels, setPendingHotels] = useState([]);
  const [rejectedHotels, setRejectedHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search, Pagination & Sorting States
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 1000);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("newest"); // 'newest', 'oldest', 'name'
  const limit = 9; // Per page items count

  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [showView, setShowView] = useState(false);

  const [selectedHotel, setSelectedHotel] = useState(null);
  const [viewHotel, setViewHotel] = useState(null);

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remark, setRemark] = useState("");

  // Submitting loader state
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (activeTab === "pending") {
      getPendingHotels();
    } else {
      getRejectedHotels();
    }
  }, [activeTab, debouncedSearchTerm, currentPage]);

  const getPendingHotels = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${signupApi}hotel/pending?search=${debouncedSearchTerm}&page=${currentPage}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setPendingHotels(response.data.hotels || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getRejectedHotels = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${signupApi}hotel/rejected?search=${debouncedSearchTerm}&page=${currentPage}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setRejectedHotels(response.data.hotels || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!password.trim()) {
      return alert("Password is required");
    }
    if (password.trim().length < 6) {
      return alert("Password must be at least 6 characters");
    }

    try {
      setSubmitting(true);
      const response = await axios.patch(
        `${signupApi}hotel/approve/${selectedHotel._id}`,
        { password },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      alert(
        response.data.message ||
          "Hotel approved and user credentials synchronised.",
      );

      setPassword("");
      setShowApprove(false);
      setSelectedHotel(null);

      getPendingHotels();
      getRejectedHotels();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Something went wrong during data configuration sync.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!remark.trim()) {
      return alert("Remark is required");
    }

    try {
      setSubmitting(true);
      const response = await axios.patch(
        `${signupApi}hotel/reject/${selectedHotel._id}`,
        { remark },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      alert(response.data.message);

      setRemark("");
      setShowReject(false);
      setSelectedHotel(null);

      getPendingHotels();
      getRejectedHotels();
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const hotels = activeTab === "pending" ? pendingHotels : rejectedHotels;

  // Sorting Logic
  const sortedHotels = [...hotels].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === "oldest") {
      return new Date(a.createdAt) - new Date(b.createdAt);
    } else if (sortBy === "name") {
      return (a.hotelName || "").localeCompare(b.hotelName || "");
    }
    return 0;
  });

  const locationOf = (hotel) =>
    [
      hotel.city?.cityName,
      hotel.city?.districtId?.districtName,
      hotel.city?.districtId?.stateId?.stateName,
    ]
      .filter(Boolean)
      .join(", ");

  const initials = (name) =>
    (name || "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("");

  if (loading && hotels.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-[#FDFBF7]">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=IBM+Plex+Mono:wght@500&display=swap');`}</style>
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#3D271D] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-[#8C4A27] font-['IBM_Plex_Mono',monospace] text-xs uppercase tracking-wider font-semibold">
            Opening the registry…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-[#2D1E18] min-h-screen bg-[#FDFBF7] p-4 sm:p-6 lg:p-8">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600&display=swap');`}</style>

      <div className="max-w-[1240px] mx-auto">
        {/* Header Sub-Bar */}
        <div className="flex justify-between items-end gap-5 flex-wrap mb-8 pb-6 border-b border-[#E8DEC8]">
          <div>
            <p className="font-['IBM_Plex_Mono',monospace] text-[11px] tracking-[0.22em] text-[#8C4A27] mt-0 mb-2 uppercase font-semibold">
              PARTNER ONBOARDING AUDIT
            </p>
            <h1 className="font-['Plus_Jakarta_Sans',sans-serif] font-extrabold text-[28px] sm:text-[32px] tracking-tight m-0 text-[#2D1E18]">
              Hotel Verification Requests
            </h1>
            <p className="text-[#705B4E] text-[14px] mt-2 mb-0 font-medium">
              Review, validate credentials, and authorize hotel partner
              registration profiles.
            </p>
          </div>

          <div className="border border-[#E8DEC8] bg-[#F8F4EC] rounded-xl px-6 py-3.5 text-right shadow-sm">
            <p className="font-['IBM_Plex_Mono',monospace] text-[10px] tracking-[0.14em] text-[#705B4E] uppercase font-semibold mt-0 mb-1">
              Total Submissions
            </p>
            <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[28px] font-extrabold text-[#8C4A27] m-0 leading-none">
              {pendingHotels.length + rejectedHotels.length}
            </p>
          </div>
        </div>

        {/* Status Navigation Tabs, Sorting & Search Input */}
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 mb-8">
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => {
                setActiveTab("pending");
                setCurrentPage(1);
              }}
              className={`font-['Plus_Jakarta_Sans',sans-serif] text-[14px] font-bold py-2.5 px-6 rounded-full cursor-pointer flex items-center gap-2.5 transition-all duration-200 ${
                activeTab === "pending"
                  ? "text-[#FFFBF5] bg-[#3D271D] shadow-lg shadow-[#3D271D]/20"
                  : "text-[#705B4E] bg-[#F8F4EC] border border-[#E8DEC8] hover:text-[#3D271D] hover:bg-[#F1EAD9]"
              }`}
            >
              Pending Audit
              <span className="font-['IBM_Plex_Mono',monospace] text-[11px] px-2 py-0.5 bg-[rgba(255,251,245,0.2)] rounded-md">
                {pendingHotels.length}
              </span>
            </button>
            <button
              onClick={() => {
                setActiveTab("rejected");
                setCurrentPage(1);
              }}
              className={`font-['Plus_Jakarta_Sans',sans-serif] text-[14px] font-bold py-2.5 px-6 rounded-full cursor-pointer flex items-center gap-2.5 transition-all duration-200 ${
                activeTab === "rejected"
                  ? "text-[#FFF0EE] bg-[#A13A2B] shadow-lg shadow-[#A13A2B]/20"
                  : "text-[#705B4E] bg-[#F8F4EC] border border-[#E8DEC8] hover:text-[#A13A2B] hover:bg-[#FDF2F0]"
              }`}
            >
              Rejected List
              <span className="font-['IBM_Plex_Mono',monospace] text-[11px] px-2 py-0.5 bg-[rgba(255,240,238,0.2)] rounded-md">
                {rejectedHotels.length}
              </span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-center">
            {/* Sorting Dropdown */}
            <div className="flex items-center bg-[#F8F4EC] border border-[#E8DEC8] rounded-full px-3 h-10 text-[13px] text-[#2D1E18] font-medium w-full sm:w-auto">
              <ArrowUpDown size={14} className="mr-2 text-[#705B4E]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent outline-none cursor-pointer pr-2 text-[#2D1E18] font-medium w-full"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Hotel Name (A-Z)</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#705B4E]"
              />
              <input
                type="text"
                placeholder="Search hotel, admin or city..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#F8F4EC] border border-[#E8DEC8] text-[#2D1E18] text-[13px] rounded-full outline-none pl-9 pr-8 h-10 focus:border-[#8C4A27] focus:bg-white font-medium transition"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#705B4E] hover:text-[#2D1E18]"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Hotels Cards Grid */}
        {sortedHotels.length === 0 ? (
          <div className="border border-dashed border-[#E8DEC8] rounded-2xl py-20 px-5 text-center text-[#705B4E] text-[14px] bg-[#F8F4EC]">
            <p className="m-0 font-semibold">
              {debouncedSearchTerm
                ? `No results matching "${debouncedSearchTerm}"`
                : "No hotel submission entries discovered inside this module loop."}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedHotels.map((hotel) => (
              <div
                key={hotel._id}
                className="border border-[#E8DEC8] rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md hover:border-[#D4C3A3] transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-52 border-b border-[#E8DEC8] bg-[#F8F4EC] overflow-hidden">
                    {hotel.hotelImages?.[0] ? (
                      <img
                        src={hotel.hotelImages[0]}
                        alt={hotel.hotelName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#8C4A27] font-['Plus_Jakarta_Sans',sans-serif] text-xs font-bold uppercase tracking-wider">
                        No Media Blueprint Attached
                      </div>
                    )}

                    <span
                      className={`absolute top-3.5 right-3.5 font-['IBM_Plex_Mono',monospace] text-[10px] tracking-[0.12em] font-bold px-3 py-1 rounded-md border backdrop-blur-md shadow-sm ${
                        activeTab === "rejected"
                          ? "text-[#A13A2B] border-[#A13A2B]/30 bg-[#FFF5F4]"
                          : "text-[#8C4A27] border-[#8C4A27]/30 bg-[#FFF9F2]"
                      }`}
                    >
                      {activeTab === "pending" ? "PENDING" : "REJECTED"}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-3.5 mb-4">
                      <div className="w-11 h-11 rounded-full border border-[#E8DEC8] flex-shrink-0 flex items-center justify-center bg-[#F8F4EC] text-[#3D271D] font-['Plus_Jakarta_Sans',sans-serif] font-bold text-sm shadow-sm">
                        {initials(hotel.adminId?.name) || "AD"}
                      </div>

                      <div className="min-w-0">
                        <h2 className="text-[17px] font-bold text-[#2D1E18] truncate m-0 font-['Plus_Jakarta_Sans',sans-serif]">
                          {hotel.hotelName}
                        </h2>
                        <p className="text-[#705B4E] text-[12.5px] font-medium truncate mt-0.5 mb-0">
                          Admin · {hotel.adminId?.name || "System Manager"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 text-[13px] text-[#4D3A2F] border-t border-[#F1EAD9] pt-3.5">
                      <div className="flex justify-between truncate gap-2">
                        <span className="text-[#705B4E]">Hotel Contact:</span>{" "}
                        <span className="font-semibold text-[#2D1E18] truncate">
                          {hotel.hotelEmail}
                        </span>
                      </div>
                      <div className="flex justify-between truncate gap-2">
                        <span className="text-[#705B4E]">Admin Login:</span>{" "}
                        <span className="font-semibold text-[#2D1E18] truncate">
                          {hotel.adminId?.email}
                        </span>
                      </div>
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-[#705B4E] shrink-0">
                          Region Mapping:
                        </span>{" "}
                        <span className="font-semibold text-[#2D1E18] text-right line-clamp-1">
                          {locationOf(hotel) || "Not Mapped"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#705B4E]">
                          Class Specification:
                        </span>{" "}
                        <span className="font-['IBM_Plex_Mono',monospace] text-[11px] font-bold text-[#8C4A27] uppercase">
                          {hotel.hotelType} · {hotel.totalRooms} Rooms
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 bg-[#F8F4EC] p-3 rounded-lg border border-[#E8DEC8]/60">
                      <p className="text-[12.5px] text-[#705B4E] italic line-clamp-2 m-0 leading-relaxed">
                        "{hotel.description || "No descriptions detailed."}"
                      </p>
                    </div>

                    {activeTab === "rejected" && hotel.remark && (
                      <div className="mt-3 text-[12.5px] text-[#A13A2B] bg-[#FFF5F4] border-l-3 border-[#A13A2B] py-2.5 px-3 rounded-r-lg">
                        <span className="block font-['IBM_Plex_Mono',monospace] text-[9.5px] font-bold uppercase tracking-wider text-[#A13A2B] mb-0.5">
                          Audit Dismissal Reason
                        </span>
                        <p className="m-0 font-medium leading-normal">
                          {hotel.remark}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 pt-0 flex gap-2.5">
                  <button
                    onClick={() => {
                      setViewHotel(hotel);
                      setShowView(true);
                    }}
                    className="flex-1 font-semibold py-2.5 rounded-lg text-xs border border-[#E8DEC8] bg-white text-[#4D3A2F] hover:bg-[#F8F4EC] hover:text-[#2D1E18] transition-colors cursor-pointer"
                  >
                    View
                  </button>

                  {activeTab === "pending" && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedHotel(hotel);
                          setShowApprove(true);
                        }}
                        className="flex-1 font-bold py-2.5 rounded-lg text-xs bg-[#2F6F4E]/10 border border-[#2F6F4E]/30 text-[#2F6F4E] hover:bg-[#2F6F4E] hover:text-white transition-all cursor-pointer"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => {
                          setSelectedHotel(hotel);
                          setShowReject(true);
                        }}
                        className="flex-1 font-bold py-2.5 rounded-lg text-xs bg-[#A13A2B]/10 border border-[#A13A2B]/30 text-[#A13A2B] hover:bg-[#A13A2B] hover:text-white transition-all cursor-pointer"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="px-4 py-2 border border-[#E8DEC8] rounded-lg bg-white disabled:opacity-40 flex items-center gap-1 font-semibold text-xs cursor-pointer hover:bg-[#F8F4EC] transition"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <span className="text-xs font-['IBM_Plex_Mono',monospace] font-bold text-[#705B4E]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              className="px-4 py-2 border border-[#E8DEC8] rounded-lg bg-white disabled:opacity-40 flex items-center gap-1 font-semibold text-xs cursor-pointer hover:bg-[#F8F4EC] transition"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Approve Modal */}
      {showApprove && (
        <div className="fixed inset-0 bg-[#2D1E18]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#E8DEC8] rounded-2xl p-7 w-full max-w-[440px] shadow-2xl">
            <p className="font-['IBM_Plex_Mono',monospace] text-[10px] tracking-[0.18em] text-[#8C4A27] uppercase font-bold mt-0 mb-2">
              AUTHORIZE PLATFORM CREDENTIALS
            </p>
            <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-[21px] font-extrabold text-[#2D1E18] mt-0 mb-2">
              Approve {selectedHotel?.hotelName}
            </h2>
            <p className="text-[#705B4E] text-[13px] font-medium mt-0 mb-5 leading-normal">
              Generate a system access security password to sync and register
              this admin credential payload.
            </p>

            <label className="block text-[11px] font-['IBM_Plex_Mono',monospace] text-[#705B4E] uppercase tracking-wide mb-1.5 font-semibold">
              Security Password
            </label>
            <div className="relative mb-1">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Min. 6 alphanumeric characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                disabled={submitting}
                className="w-full bg-[#F8F4EC] border border-[#E8DEC8] text-[#2D1E18] text-[13.5px] rounded-lg outline-none pr-10 h-11 pl-3.5 focus:border-[#8C4A27] focus:bg-white font-medium transition disabled:opacity-50"
              />
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#705B4E] cursor-pointer hover:text-[#2D1E18]"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? "Hide" : "Show"}
              </span>
            </div>

            <div className="flex gap-2.5 mt-6 pt-4 border-t border-[#F1EAD9]">
              <button
                onClick={() => {
                  setShowApprove(false);
                  setPassword("");
                }}
                disabled={submitting}
                className="flex-1 font-semibold rounded-lg border border-[#E8DEC8] bg-white text-[#4D3A2F] hover:bg-[#F8F4EC] text-xs py-2.5 transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={submitting}
                className="flex-1 font-bold rounded-lg bg-[#3D271D] text-[#FFFBF5] hover:bg-[#2D1E18] text-xs py-2.5 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
              >
                {submitting && <Loader2 className="animate-spin" size={15} />}
                {submitting ? "Approving..." : "Confirm Approval"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showReject && (
        <div className="fixed inset-0 bg-[#2D1E18]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#E8DEC8] rounded-2xl p-7 w-full max-w-[440px] shadow-2xl">
            <p className="font-['IBM_Plex_Mono',monospace] text-[10px] tracking-[0.18em] text-[#A13A2B] uppercase font-bold mt-0 mb-2">
              DISMISS REGISTRATION TASK
            </p>
            <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-[21px] font-extrabold text-[#2D1E18] mt-0 mb-2">
              Reject {selectedHotel?.hotelName}
            </h2>
            <p className="text-[#705B4E] text-[13px] font-medium mt-0 mb-5 leading-normal">
              Specify the technical or regulatory audit reason regarding why
              this partner is being denied.
            </p>

            <label className="block text-[11px] font-['IBM_Plex_Mono',monospace] text-[#705B4E] uppercase tracking-wide mb-1.5 font-semibold">
              Audit Remark Reason
            </label>
            <textarea
              rows={4}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="State detailed reason..."
              autoFocus
              disabled={submitting}
              className="w-full bg-[#F8F4EC] border border-[#E8DEC8] text-[#2D1E18] text-[13.5px] rounded-lg outline-none p-3.5 resize-none transition focus:border-[#8C4A27] focus:bg-white font-medium disabled:opacity-50"
            />

            <div className="flex gap-2.5 mt-6 pt-4 border-t border-[#F1EAD9]">
              <button
                onClick={() => {
                  setShowReject(false);
                  setRemark("");
                }}
                disabled={submitting}
                className="flex-1 font-semibold rounded-lg border border-[#E8DEC8] bg-white text-[#4D3A2F] hover:bg-[#F8F4EC] text-xs py-2.5 transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={submitting}
                className="flex-1 font-bold rounded-lg bg-[#A13A2B] text-[#FFF0EE] hover:bg-[#852E22] text-xs py-2.5 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
              >
                {submitting && <Loader2 className="animate-spin" size={15} />}
                {submitting ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showView && viewHotel && (
        <div className="fixed inset-0 bg-[#2D1E18]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#E8DEC8] rounded-2xl w-full max-w-3xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center border-b border-[#E8DEC8] p-5 bg-[#F8F4EC] z-20 shrink-0">
              <div>
                <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-[19px] font-extrabold text-[#2D1E18] m-0">
                  Listing Inspection Profile
                </h2>
                <p className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#8C4A27] mt-1 m-0 uppercase tracking-wider font-semibold">
                  MAPPED ADMIN LOG TRACK: {viewHotel.trackingId || "N/A"}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowView(false);
                  setViewHotel(null);
                }}
                className="text-[#705B4E] hover:text-[#2D1E18] text-[16px] w-8 h-8 bg-white rounded-lg border border-[#E8DEC8] flex items-center justify-center transition cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 text-[13.5px] overflow-y-auto flex-1 bg-white">
              <div>
                <p className="font-['IBM_Plex_Mono',monospace] text-[10.5px] text-[#705B4E] uppercase tracking-wider mb-2.5 font-semibold">
                  Property Media Gallery ({viewHotel.hotelImages?.length || 0})
                </p>
                {viewHotel.hotelImages?.length > 0 ? (
                  <div className="flex gap-4 overflow-x-auto pb-3">
                    {viewHotel.hotelImages.map((imgUrl, index) => (
                      <div
                        key={index}
                        className="w-[320px] h-[220px] rounded-xl overflow-hidden border border-[#E8DEC8] bg-[#F8F4EC] shadow-sm shrink-0"
                      >
                        <img
                          src={imgUrl}
                          alt={`${viewHotel.hotelName} - ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-[#F8F4EC] border border-dashed border-[#E8DEC8] rounded-xl text-center text-[#705B4E] text-xs font-medium">
                    No media blueprints attached.
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-x-6 gap-y-4 bg-[#F8F4EC] rounded-xl border border-[#E8DEC8] p-5">
                <div>
                  <p className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#705B4E] uppercase tracking-wider font-semibold">
                    Hotel Identity
                  </p>
                  <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[#2D1E18] text-[15px] mt-0.5 m-0">
                    {viewHotel.hotelName}
                  </h3>
                </div>
                <div>
                  <p className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#705B4E] uppercase tracking-wider font-semibold">
                    Registered By (Admin)
                  </p>
                  <h3 className="font-semibold text-[#2D1E18] mt-0.5 m-0">
                    {viewHotel.adminId?.name || "System Manager"}
                  </h3>
                </div>
                <div>
                  <p className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#705B4E] uppercase tracking-wider font-semibold">
                    Hotel Email Link
                  </p>
                  <h3 className="font-semibold text-[#4D3A2F] break-all mt-0.5 m-0">
                    {viewHotel.hotelEmail}
                  </h3>
                </div>
                <div>
                  <p className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#705B4E] uppercase tracking-wider font-semibold">
                    Admin User Account Link
                  </p>
                  <h3 className="font-semibold text-[#4D3A2F] break-all mt-0.5 m-0">
                    {viewHotel.adminId?.email}
                  </h3>
                </div>
                <div>
                  <p className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#705B4E] uppercase tracking-wider font-semibold">
                    Accommodation Class
                  </p>
                  <h3 className="font-semibold text-[#2D1E18] mt-0.5 m-0">
                    {viewHotel.hotelType}
                  </h3>
                </div>
                <div>
                  <p className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#705B4E] uppercase tracking-wider font-semibold">
                    Total Active Vault Rooms
                  </p>
                  <h3 className="font-bold text-[#8C4A27] mt-0.5 m-0">
                    {viewHotel.totalRooms} Rooms
                  </h3>
                </div>
              </div>

              <div className="space-y-3.5">
                <div>
                  <p className="font-['IBM_Plex_Mono',monospace] text-[10.5px] text-[#705B4E] uppercase tracking-wider font-semibold">
                    Geographic Region Mapping
                  </p>
                  <h3 className="font-semibold text-[#2D1E18] text-sm mt-0.5 m-0">
                    {locationOf(viewHotel) || "No Region Connected"}
                  </h3>
                </div>
                <div>
                  <p className="font-['IBM_Plex_Mono',monospace] text-[10.5px] text-[#705B4E] uppercase tracking-wider font-semibold">
                    Physical Street Address
                  </p>
                  <h3 className="font-medium text-[#4D3A2F] bg-[#F8F4EC] rounded-xl p-3.5 border border-[#E8DEC8] mt-1 font-sans m-0">
                    {viewHotel.address}
                  </h3>
                </div>
              </div>

              {viewHotel.amenities?.length > 0 && (
                <div>
                  <p className="font-['IBM_Plex_Mono',monospace] text-[10.5px] text-[#705B4E] uppercase tracking-wider mb-2 font-semibold">
                    Infrastructure Amenities Blueprint
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {viewHotel.amenities.map((item, idx) => (
                      <span
                        key={idx}
                        className="bg-[#8C4A27]/10 text-[#8C4A27] text-[12px] px-3 py-1 rounded-md border border-[#8C4A27]/20 font-semibold"
                      >
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {viewHotel.remark && (
                <div className="bg-[#FFF5F4] border border-[#A13A2B]/30 p-4 rounded-xl">
                  <p className="text-[#A13A2B] font-['IBM_Plex_Mono',monospace] text-[10px] font-bold uppercase tracking-wider m-0">
                    Audit Dismissal Log Remark
                  </p>
                  <p className="text-[#2D1E18] font-medium text-[13px] mt-1.5 m-0 leading-relaxed">
                    {viewHotel.remark}
                  </p>
                </div>
              )}

              <div>
                <p className="font-['IBM_Plex_Mono',monospace] text-[10.5px] text-[#705B4E] uppercase tracking-wider font-semibold">
                  Establishment Overview Summary
                </p>
                <p className="leading-relaxed text-[#4D3A2F] mt-1 bg-[#F8F4EC] p-4 rounded-xl border border-[#E8DEC8] italic m-0">
                  "{viewHotel.description || "No descriptions specified."}"
                </p>
              </div>
            </div>

            <div className="flex justify-end p-4 border-t border-[#E8DEC8] bg-[#F8F4EC] z-20 shrink-0">
              <button
                onClick={() => {
                  setShowView(false);
                  setViewHotel(null);
                }}
                className="bg-[#3D271D] hover:bg-[#2D1E18] text-[#FFFBF5] px-6 py-2.5 text-xs font-bold rounded-lg transition cursor-pointer shadow-md"
              >
                Close Inspection Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingHotels;

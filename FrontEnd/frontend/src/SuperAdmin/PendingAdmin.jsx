import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { signupApi } from "../api";
 import useDebounce from "../hooks/useDebounce"; 
import {
  Eye,
  CheckCircle,
  XCircle,
  EyeOff,
  Lock,
  MessageSquare,
  Loader2,
  ShieldAlert,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const PendingAdmins = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search, Filter, Sort & Pagination States
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("desc"); // 'asc' ya 'desc'
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Debounced search value (Agar useDebounce hook hai toh use karein, nahi toh direct search use kar sakte hain)
  // const debouncedSearch = useDebounce(search, 500);
  const debouncedSearch = search; // Agar hook nahi hai toh direct variable rakhein

  // Modals & Form States
  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [showView, setShowView] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [viewAdmin, setViewAdmin] = useState(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remark, setRemark] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch Admins based on activeTab, search, sort, and pagination
  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      // Endpoint decide karein tab ke mutabiq
      const endpoint = activeTab === "pending" ? "admin/pending" : "admin/rejected";

      const response = await axios.get(`${signupApi}${endpoint}`, {
        params: {
          search: debouncedSearch,
          sort,
          page,
          limit,
        },
      });

      setAdmins(response.data.admins || response.data.result || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalRecords(response.data.total || response.data.totalRecords || 0);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, debouncedSearch, sort, page, limit]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // Tab change hone par page ko 1 par reset karein
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setSearch("");
  };

  const handleApprove = async () => {
    if (!password.trim()) return alert("Password is required");

    try {
      setSubmitting(true);
      const response = await axios.patch(
        `${signupApi}admin/approve/${selectedAdmin._id}`,
        { password }
      );
      alert(response.data.message);

      setPassword("");
      setShowApprove(false);
      setSelectedAdmin(null);
      fetchAdmins();
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!remark.trim()) return alert("Remark is required");

    try {
      setSubmitting(true);
      const response = await axios.patch(
        `${signupApi}admin/reject/${selectedAdmin._id}`,
        { remark }
      );
      alert(response.data.message);

      setRemark("");
      setShowReject(false);
      setSelectedAdmin(null);
      fetchAdmins();
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const initials = (name) =>
    (name || "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("");

  return (
    <div className="space-y-6 font-['Inter',sans-serif] bg-[#FAF8F5] p-6 rounded-2xl min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-end gap-4 flex-wrap mb-6">
        <div>
          <p className="font-['IBM_Plex_Mono'] text-[11px] font-semibold tracking-[0.2em] text-[#8C6239] mb-1.5 uppercase">
            Authorization Queue
          </p>
          <h1 className="font-['Space_Grotesk'] font-bold text-[30px] text-[#3D2612] tracking-tight mb-1">
            Admin Requests
          </h1>
          <p className="text-[#6E5948] text-[13.5px]">
            {totalRecords} total requests on record
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-[#E3D5C5]">
        <button
          onClick={() => handleTabChange("pending")}
          className={`pb-3 -mb-px text-[14px] font-semibold flex items-center gap-2.5 transition-colors border-b-2 cursor-pointer ${
            activeTab === "pending"
              ? "text-[#3D2612] border-[#8C6239]"
              : "text-[#9A8778] border-transparent hover:text-[#523A28]"
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => handleTabChange("rejected")}
          className={`pb-3 -mb-px text-[14px] font-semibold flex items-center gap-2.5 transition-colors border-b-2 cursor-pointer ${
            activeTab === "rejected"
              ? "text-[#8B3A3A] border-[#8B3A3A]"
              : "text-[#9A8778] border-transparent hover:text-[#8B3A3A]"
          }`}
        >
          Rejected
        </button>
      </div>

      {/* Controls Bar (Search & Sort) */}
      <div className="flex justify-between items-center gap-4 flex-wrap bg-[#FFFDFB] p-4 rounded-2xl border border-[#E3D5C5]">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A8778]" size={16} />
          <input
            type="text"
            placeholder="Search by name, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Search karte hi first page par bhejein
            }}
            className="w-full h-10 rounded-xl border border-[#E3D5C5] bg-[#FAF8F5] pl-10 pr-4 text-[13.5px] outline-none transition focus:border-[#8C6239] focus:bg-white text-[#3D2612]"
          />
        </div>

        {/* Sort & Limit Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#FAF8F5] border border-[#E3D5C5] px-3 py-2 rounded-xl">
            <ArrowUpDown size={14} className="text-[#8C6239]" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-transparent text-[13px] text-[#3D2612] outline-none cursor-pointer font-medium"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>

          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="h-10 bg-[#FAF8F5] border border-[#E3D5C5] px-3 rounded-xl text-[13px] text-[#3D2612] outline-none cursor-pointer font-medium"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
          </select>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-[#FFFDFB] border border-[#E3D5C5] rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-3">
            <Loader2 className="animate-spin text-[#8C6239]" size={32} />
            <p className="font-['IBM_Plex_Mono'] text-[11px] text-[#8C6239] uppercase tracking-widest font-semibold">
              Loading Registry...
            </p>
          </div>
        ​) : admins.length === 0 ? (
          <div className="text-center py-20">
            <ShieldAlert className="mx-auto text-[#C2B2A3] mb-3" size={44} />
            <h4 className="font-['Space_Grotesk'] text-lg font-bold text-[#3D2612] mb-1">
              No requests found
            </h4>
            <p className="text-[13px] text-[#6E5948]">
              The {activeTab} queue is currently empty or no match found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F5EFE6] border-b border-[#E3D5C5]">
                  <th className="font-['IBM_Plex_Mono'] text-[10.5px] font-bold text-[#6E5948] uppercase tracking-widest px-6 py-4">
                    Applicant
                  </th>
                  <th className="font-['IBM_Plex_Mono'] text-[10.5px] font-bold text-[#6E5948] uppercase tracking-widest px-6 py-4">
                    Contact Details
                  </th>
                  <th className="font-['IBM_Plex_Mono'] text-[10.5px] font-bold text-[#6E5948] uppercase tracking-widest px-6 py-4">
                    Tracking ID
                  </th>
                  <th className="font-['IBM_Plex_Mono'] text-[10.5px] font-bold text-[#6E5948] uppercase tracking-widest px-6 py-4">
                    Status
                  </th>
                  <th className="font-['IBM_Plex_Mono'] text-[10.5px] font-bold text-[#6E5948] uppercase tracking-widest px-6 py-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3D5C5]">
                {admins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-[#F8F2EA]/80 transition-colors">
                    {/* Applicant */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        {admin.profileImage ? (
                          <img
                            src={admin.profileImage}
                            alt="profile"
                            className="w-10 h-10 rounded-full object-cover border border-[#C2B2A3]"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full border border-[#D1C2B4] bg-[#EFEAE2] text-[#8C6239] font-['Space_Grotesk'] text-sm font-bold flex items-center justify-center">
                            {initials(admin.name)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-[#3D2612] text-[14px]">{admin.name}</p>
                          <p className="text-[12px] text-[#6E5948] mt-0.5 max-w-[170px] truncate">
                            {admin.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4">
                      <p className="font-medium text-[#3D2612] text-[13.5px]">
                        {admin.mobile || "N/A"}
                      </p>
                    </td>

                    {/* Tracking ID */}
                    <td className="px-6 py-4">
                      <span className="font-['IBM_Plex_Mono'] text-[11px] text-[#6E5948] bg-[#F5EFE6] px-2.5 py-1 rounded-md border border-[#E3D5C5] font-medium">
                        {admin.trackingId || "N/A"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {activeTab === "pending" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-bold uppercase tracking-wider bg-[#F9F3EA] text-[#8C6239] border border-[#E3D5C5]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#8C6239]"></span>
                          Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-bold uppercase tracking-wider bg-[#FDF2F2] text-[#8B3A3A] border border-[#F2C7C7]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#8B3A3A]"></span>
                          Rejected
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setViewAdmin(admin);
                            setShowView(true);
                          }}
                          className="w-8 h-8 rounded-lg border border-[#E3D5C5] bg-white text-[#6E5948] hover:text-[#3D2612] hover:border-[#8C6239] hover:bg-[#F5EFE6] flex items-center justify-center transition cursor-pointer"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>

                        {activeTab === "pending" && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedAdmin(admin);
                                setShowApprove(true);
                              }}
                              className="w-8 h-8 rounded-lg border border-[#E3D5C5] bg-white text-[#6E5948] hover:text-[#2E6B38] hover:border-[#2E6B38] hover:bg-[#EAF3EB] flex items-center justify-center transition cursor-pointer"
                              title="Approve"
                            >
                              <CheckCircle size={15} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAdmin(admin);
                                setShowReject(true);
                              }}
                              className="w-8 h-8 rounded-lg border border-[#E3D5C5] bg-white text-[#6E5948] hover:text-[#8B3A3A] hover:border-[#8B3A3A] hover:bg-[#FDF2F2] flex items-center justify-center transition cursor-pointer"
                              title="Reject"
                            >
                              <XCircle size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && totalPages > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#E3D5C5] bg-[#F5EFE6]/50">
            <p className="text-[13px] text-[#6E5948]">
              Page <span className="font-bold text-[#3D2612]">{page}</span> of{" "}
              <span className="font-bold text-[#3D2612]">{totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="w-9 h-9 rounded-xl border border-[#E3D5C5] bg-white text-[#6E5948] hover:bg-[#F5EFE6] flex items-center justify-center disabled:opacity-40 cursor-pointer transition"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="w-9 h-9 rounded-xl border border-[#E3D5C5] bg-white text-[#6E5948] hover:bg-[#F5EFE6] flex items-center justify-center disabled:opacity-40 cursor-pointer transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals (Approve, Reject, View - Same as before) */}
      {/* Approve Modal */}
      {showApprove && (
        <div className="fixed inset-0 bg-[#2D1B0D]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#FFFDFB] border border-[#E3D5C5] rounded-2xl p-7 w-full max-w-[420px] shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-full bg-[#EAF3EB] text-[#2E6B38] flex items-center justify-center border border-[#C6E2C9]">
                <Lock size={16} />
              </div>
              <p className="font-['IBM_Plex_Mono'] text-[10.5px] font-bold tracking-widest text-[#8C6239] uppercase">
                Grant Access
              </p>
            </div>
            <h2 className="font-['Space_Grotesk'] text-xl font-bold text-[#3D2612] mb-1">
              Approve {selectedAdmin?.name}
            </h2>
            <p className="text-[13px] text-[#6E5948] mb-6">
              Set a login password to authorize this account.
            </p>

            <div className="mb-6 relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                disabled={submitting}
                className="w-full h-11 rounded-xl border border-[#E3D5C5] bg-[#FAF8F5] pl-4 pr-10 text-[14px] outline-none transition focus:border-[#8C6239] focus:bg-white text-[#3D2612] font-medium disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A8778] hover:text-[#3D2612] transition cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowApprove(false);
                  setPassword("");
                }}
                disabled={submitting}
                className="h-10 px-5 rounded-xl text-[13px] font-semibold text-[#6E5948] bg-[#EFEAE2] hover:bg-[#E3D5C5] hover:text-[#3D2612] transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={submitting}
                className="h-10 px-5 rounded-xl text-[13px] font-semibold text-white bg-[#2E6B38] hover:bg-[#23532B] transition shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
        <div className="fixed inset-0 bg-[#2D1B0D]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#FFFDFB] border border-[#E3D5C5] rounded-2xl p-7 w-full max-w-[420px] shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-full bg-[#FDF2F2] text-[#8B3A3A] flex items-center justify-center border border-[#F2C7C7]">
                <MessageSquare size={16} />
              </div>
              <p className="font-['IBM_Plex_Mono'] text-[10.5px] font-bold tracking-widest text-[#8B3A3A] uppercase">
                Deny Access
              </p>
            </div>
            <h2 className="font-['Space_Grotesk'] text-xl font-bold text-[#3D2612] mb-1">
              Reject {selectedAdmin?.name}
            </h2>
            <p className="text-[13px] text-[#6E5948] mb-6">
              State the reason this request is being turned down.
            </p>

            <div className="mb-6">
              <textarea
                rows={4}
                placeholder="Enter rejection reason..."
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                autoFocus
                disabled={submitting}
                className="w-full rounded-xl border border-[#E3D5C5] bg-[#FAF8F5] p-4 text-[13.5px] outline-none transition focus:border-[#8B3A3A] focus:bg-white text-[#3D2612] resize-none disabled:opacity-50"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowReject(false);
                  setRemark("");
                }}
                disabled={submitting}
                className="h-10 px-5 rounded-xl text-[13px] font-semibold text-[#6E5948] bg-[#EFEAE2] hover:bg-[#E3D5C5] hover:text-[#3D2612] transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={submitting}
                className="h-10 px-5 rounded-xl text-[13px] font-semibold text-white bg-[#8B3A3A] hover:bg-[#6E2E2E] transition shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting && <Loader2 className="animate-spin" size={15} />}
                {submitting ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showView && viewAdmin && (
        <div className="fixed inset-0 bg-[#2D1B0D]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#FFFDFB] border border-[#E3D5C5] rounded-2xl p-7 w-full max-w-[480px] shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              {viewAdmin.profileImage ? (
                <img
                  src={viewAdmin.profileImage}
                  alt="profile"
                  className="w-14 h-14 rounded-full object-cover border border-[#C2B2A3]"
                />
              ) : (
                <div className="w-14 h-14 rounded-full border border-[#D1C2B4] bg-[#EFEAE2] text-[#8C6239] font-['Space_Grotesk'] text-lg font-bold flex items-center justify-center">
                  {initials(viewAdmin.name)}
                </div>
              )}
              <div>
                <h2 className="font-['Space_Grotesk'] text-[20px] font-bold text-[#3D2612] leading-tight">
                  {viewAdmin.name}
                </h2>
                <p className="font-['IBM_Plex_Mono'] text-[11px] font-bold text-[#8C6239] uppercase tracking-wider mt-1">
                  ID: {viewAdmin.trackingId || "N/A"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#F5EFE6] rounded-xl p-3.5 border border-[#E3D5C5]">
                <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold tracking-widest text-[#8C6239] uppercase mb-1">
                  Email
                </p>
                <p className="text-[13.5px] text-[#3D2612] font-medium truncate">
                  {viewAdmin.email}
                </p>
              </div>
              <div className="bg-[#F5EFE6] rounded-xl p-3.5 border border-[#E3D5C5]">
                <p className="font-['IBM_Plex_Mono'] text-[10.5px] font-bold tracking-widest text-[#8C6239] uppercase mb-1">
                  Mobile
                </p>
                <p className="text-[13.5px] text-[#3D2612] font-medium truncate">
                  {viewAdmin.mobile || "N/A"}
                </p>
              </div>
            </div>

            {viewAdmin.remark && (
              <div className="bg-[#FDF2F2] border border-[#F2C7C7] rounded-xl p-4 mb-6">
                <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold tracking-widest text-[#8B3A3A] uppercase mb-1">
                  Rejection Reason
                </p>
                <p className="text-[13px] text-[#6E2E2E]">{viewAdmin.remark}</p>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowView(false);
                  setViewAdmin(null);
                }}
                className="h-10 px-6 rounded-xl text-[13px] font-semibold text-[#FFFDFB] bg-[#523A28] hover:bg-[#3D2612] transition shadow-sm cursor-pointer"
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

export default PendingAdmins;
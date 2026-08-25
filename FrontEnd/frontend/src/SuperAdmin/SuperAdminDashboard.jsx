import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { signupApi } from "../api";
import useDebounce from "../hooks/useDebounce";
import {
  Building2,
  Plus,
  Trash2,
  Edit,
  Search,
  BedDouble,
  MapPin,
  ShieldCheck,
  Loader2,
  X,
  Eye,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Modal States
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewHotel, setViewHotel] = useState(null);

  // Debounce hook use kiya hai (500ms delay)
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    getAllHotels();
  }, [debouncedSearch, selectedAdmin, selectedCity, sortOrder, page]);

  const getAllHotels = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${signupApi}hotel/all`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search: debouncedSearch,
          adminId: selectedAdmin,
          cityId: selectedCity,
          sort: sortOrder,
          page,
          limit,
        },
      });
      setHotels(response.data.hotels || response.data.result || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching hotels:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Kya aap sach me is hotel ko delete krna chahte hain?"))
      return;
    try {
      await axios.delete(`${signupApi}hotel/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      getAllHotels();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete hotel");
    }
  };

  // Dynamic Statistics
  const totalRooms = hotels.reduce(
    (sum, h) => sum + Number(h.totalRooms || 0),
    0,
  );
  const totalAdmins = new Set(hotels.map((h) => h.adminId?._id).filter(Boolean))
    .size;

  // Unique lists for dropdown filters
  const uniqueAdmins = Array.from(
    new Map(
      hotels
        .filter((h) => h.adminId?._id)
        .map((h) => [h.adminId._id, h.adminId]),
    ).values(),
  );

  const uniqueCities = Array.from(
    new Map(
      hotels.filter((h) => h.city?._id).map((h) => [h.city._id, h.city]),
    ).values(),
  );

  // Pie Chart Data Logic (City Distribution)
  const cityCounts = hotels.reduce((acc, h) => {
    const cName = h.city?.cityName || "Unassigned";
    acc[cName] = (acc[cName] || 0) + 1;
    return acc;
  }, {});

  const cityChartData = Object.entries(cityCounts).map(([name, count]) => ({
    name,
    count,
    percentage: hotels.length ? Math.round((count / hotels.length) * 100) : 0,
  }));

  const pieColors = ["#047857", "#d97706", "#059669", "#f59e0b", "#10b981"];

  return (
    <div className="bg-neutral-50 min-h-screen p-6 text-neutral-900 font-sans">
      {/* 1. TOP NAVBAR */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Super Admin Dashboard
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Centralized System Overview & Management
          </p>
        </div>

        {/* Search Bar & User Profile */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search hotel, admin, city..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full bg-white pl-10 pr-4 py-2 rounded-full text-xs outline-none border border-neutral-200 shadow-sm focus:border-emerald-600 transition"
            />
          </div>

          <div className="flex items-center gap-3 bg-white p-1.5 pl-3 rounded-full border border-neutral-200 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
              SA
            </div>
            <div className="text-left pr-2">
              <p className="text-xs font-bold leading-tight text-neutral-900">
                Super Admin
              </p>
              <p className="text-[10px] text-emerald-700 font-semibold">
                System Manager
              </p>
            </div>
            <button
              onClick={() => navigate("/superAdmin/addHotel")}
              className="bg-emerald-700 hover:bg-emerald-800 text-white p-1.5 rounded-full transition shadow-sm"
              title="Add New Hotel"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* MAIN GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* TOP STAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-emerald-700 to-emerald-800 text-white p-5 rounded-2xl border border-emerald-700 flex items-center justify-between shadow-md">
              <div>
                <p className="text-xs font-medium text-emerald-100">
                  Total Properties
                </p>
                <h2 className="text-3xl font-bold text-white mt-1">
                  {hotels.length}
                </h2>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-emerald-100">
                <Building2 size={22} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-neutral-200 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs font-semibold text-neutral-500">
                  Managed Rooms
                </p>
                <h2 className="text-3xl font-bold text-neutral-900 mt-1">
                  {totalRooms}
                </h2>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
                <BedDouble size={22} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-neutral-200 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs font-semibold text-neutral-500">
                  Assigned Admins
                </p>
                <h2 className="text-3xl font-bold text-neutral-900 mt-1">
                  {totalAdmins}
                </h2>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
                <ShieldCheck size={22} />
              </div>
            </div>
          </div>

          {/* REAL DATA TABLE WITH SEARCH, FILTERS & SORTING */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3 bg-neutral-50">
              <h3 className="font-bold text-neutral-900 text-sm">
                All Properties Directory
              </h3>
              <div className="flex items-center gap-2">
                <select
                  value={selectedAdmin}
                  onChange={(e) => {
                    setSelectedAdmin(e.target.value);
                    setPage(1);
                  }}
                  className="bg-white border border-neutral-200 text-xs rounded-lg px-2.5 py-1.5 outline-none text-neutral-900"
                >
                  <option value="">All Admins</option>
                  {uniqueAdmins.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setPage(1);
                  }}
                  className="bg-white border border-neutral-200 text-xs rounded-lg px-2.5 py-1.5 outline-none text-neutral-900"
                >
                  <option value="">All Cities</option>
                  {uniqueCities.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.cityName}
                    </option>
                  ))}
                </select>

                <select
                  value={sortOrder}
                  onChange={(e) => {
                    setSortOrder(e.target.value);
                    setPage(1);
                  }}
                  className="bg-white border border-neutral-200 text-xs rounded-lg px-2.5 py-1.5 outline-none text-neutral-900"
                >
                  <option value="asc">Sort A-Z</option>
                  <option value="desc">Sort Z-A</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <Loader2
                  className="animate-spin text-emerald-700 mx-auto mb-2"
                  size={28}
                />
                <p className="text-xs text-neutral-500">
                  Loading property data...
                </p>
              </div>
            ) : hotels.length === 0 ? (
              <div className="p-12 text-center">
                <Building2 className="text-neutral-200 mx-auto mb-2" size={40} />
                <p className="text-sm font-semibold text-neutral-900">
                  No Hotels Found
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  Try resetting your search or filters.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 text-[11px] font-semibold text-neutral-500 uppercase">
                      <th className="px-5 py-3">Hotel Info</th>
                      <th className="px-5 py-3">City</th>
                      <th className="px-5 py-3">Assigned Admin</th>
                      <th className="px-5 py-3">Capacity</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 text-xs">
                    {hotels.map((hotel) => (
                      <tr
                        key={hotel._id}
                        className="hover:bg-neutral-50/60 transition"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-neutral-50 border border-neutral-200 overflow-hidden shrink-0 flex items-center justify-center">
                              {hotel.hotelImages?.[0] ? (
                                <img
                                  src={hotel.hotelImages[0]}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Building2
                                  size={16}
                                  className="text-neutral-400"
                                />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-neutral-900">
                                {hotel.hotelName}
                              </p>
                              <p className="text-[11px] text-neutral-500">
                                {hotel.hotelEmail || "N/A"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3">
                          <span className="font-medium text-neutral-900 flex items-center gap-1">
                            <MapPin size={12} className="text-emerald-700" />
                            {hotel.city?.cityName || "N/A"}
                          </span>
                        </td>

                        <td className="px-5 py-3">
                          {hotel.adminId ? (
                            <div>
                              <p className="font-semibold text-neutral-900">
                                {hotel.adminId.name}
                              </p>
                              <p className="text-[10px] text-neutral-500">
                                {hotel.adminId.email}
                              </p>
                            </div>
                          ) : (
                            <span className="text-[10px] bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded font-semibold">
                              Unassigned
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-3 font-bold text-neutral-900">
                          {hotel.totalRooms || 0} Rooms
                        </td>

                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setViewHotel(hotel);
                                setShowViewModal(true);
                              }}
                              className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded transition"
                              title="Inspect Hotel"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() =>
                                navigate(`/superAdmin/addHotel?id=${hotel._id}`)
                              }
                              className="p-1.5 text-neutral-500 hover:text-emerald-700 hover:bg-neutral-100 rounded transition"
                              title="Edit Hotel"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(hotel._id)}
                              className="p-1.5 text-neutral-500 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                              title="Delete Hotel"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-200 bg-neutral-50">
              <span className="text-xs font-medium text-neutral-500">
                Page <span className="font-bold text-neutral-900">{page}</span> of{" "}
                <span className="font-bold text-neutral-900">
                  {totalPages || 1}
                </span>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-200 bg-white text-neutral-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-100 transition"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-200 bg-white text-neutral-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-100 transition"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - ANALYTICS & BREAKDOWN */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
            <h3 className="font-bold text-neutral-900 text-sm mb-4">
              City Distribution Analytics
            </h3>
            {cityChartData.length === 0 ? (
              <p className="text-xs text-neutral-500 text-center py-6">
                No city analytics available
              </p>
            ) : (
              <div className="space-y-3">
                {cityChartData.map((item, index) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-neutral-900">
                        {item.name}
                      </span>
                      <span className="text-neutral-500">
                        {item.count} hotels ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden border border-neutral-200">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: pieColors[index % pieColors.length],
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
            <h3 className="font-bold text-neutral-900 text-sm mb-4">
              System Overview
            </h3>
            <div className="space-y-3 text-xs">
              <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 flex justify-between items-center">
                <span className="text-neutral-500 font-medium">
                  Active Cities
                </span>
                <span className="font-bold text-neutral-900">
                  {uniqueCities.length}
                </span>
              </div>
              <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 flex justify-between items-center">
                <span className="text-neutral-500 font-medium">
                  Active Admins
                </span>
                <span className="font-bold text-neutral-900">
                  {uniqueAdmins.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW MODAL */}
      {showViewModal && viewHotel && (
        <div
          onClick={() => setShowViewModal(false)}
          className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-200"
          >
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="font-bold text-neutral-900 text-base">
                {viewHotel.hotelName}
              </h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-1 rounded-full text-neutral-500 hover:bg-neutral-100"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                  <p className="text-[10px] text-neutral-500 font-semibold uppercase">
                    City
                  </p>
                  <p className="font-bold text-neutral-900 mt-0.5">
                    {viewHotel.city?.cityName || "N/A"}
                  </p>
                </div>
                <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                  <p className="text-[10px] text-neutral-500 font-semibold uppercase">
                    Capacity
                  </p>
                  <p className="font-bold text-neutral-900 mt-0.5">
                    {viewHotel.totalRooms || 0} Rooms
                  </p>
                </div>
              </div>
              <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                <p className="text-[10px] text-neutral-500 font-semibold uppercase mb-1">
                  Assigned Admin Details
                </p>
                {viewHotel.adminId ? (
                  <div>
                    <p className="font-bold text-neutral-900">
                      {viewHotel.adminId.name}
                    </p>
                    <p className="text-neutral-500">{viewHotel.adminId.email}</p>
                  </div>
                ) : (
                  <p className="text-rose-600 font-semibold">
                    No Admin Assigned
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
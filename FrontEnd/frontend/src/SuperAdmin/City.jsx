import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { signupApi } from "../api";
import useDebounce from "../hooks/useDebounce"; // Aapke path ke mutabiq adjust kar lein
import {
  Plus,
  Search,
  Eye,
  Edit,
  Ban,
  RotateCcw,
  Trash2,
  Loader2,
  Building2,
  CheckCircle2,
  XCircle,
  X,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const City = () => {
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("active");

  const [cityName, setCityName] = useState("");
  const [districtId, setDistrictId] = useState("");

  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [inactiveCities, setInactiveCities] = useState([]);
  const [viewData, setViewData] = useState(null);

  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState("");

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 1000); // Aapka banaya hua hook

  const [sort, setSort] = useState("asc");
  const [districtFilter, setDistrictFilter] = useState("");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    getDistricts();
    getCities();
    getInactiveCities();
  }, []);

  // Reset page to 1 when tab, search, or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, debouncedSearch, districtFilter, sort, itemsPerPage]);

  const getDistricts = async () => {
    try {
      const response = await axios.get(`${signupApi}district/active`);
      setDistricts(response.data.result || []);
    } catch (error) {
      console.log(error);
    }
  };

  const getCities = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${signupApi}city/active`);
      setCities(response.data.result || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getInactiveCities = async () => {
    try {
      const response = await axios.get(`${signupApi}city/inactive`);
      setInactiveCities(response.data.result || []);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async () => {
    if (!cityName.trim() || !districtId)
      return alert("City name and District are required");

    try {
      const endpoint = isEdit ? `city/update/${editId}` : `city/create`;
      const method = isEdit ? axios.patch : axios.post;

      const response = await method(`${signupApi}${endpoint}`, {
        cityName,
        districtId,
      });

      alert(response.data.message);
      resetForm();
      getCities();
      getInactiveCities();
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  const resetForm = () => {
    setCityName("");
    setDistrictId("");
    setShowModal(false);
    setIsEdit(false);
    setEditId("");
  };

  const handleView = async (id) => {
    try {
      const response = await axios.get(`${signupApi}city/${id}`);
      setViewData(response.data.result);
      setShowViewModal(true);
    } catch (error) {
      console.log(error);
    }
  };

  const handleEdit = (item) => {
    setIsEdit(true);
    setEditId(item._id);
    setCityName(item.cityName);
    setDistrictId(item.districtId?._id);
    setShowModal(true);
  };

  const handleInactive = async (id) => {
    try {
      const response = await axios.patch(`${signupApi}city/inactive/${id}`);
      alert(response.data.message);
      getCities();
      getInactiveCities();
    } catch (error) {
      console.log(error);
    }
  };

  const handleRestore = async (id) => {
    try {
      const response = await axios.patch(`${signupApi}city/restore/${id}`);
      alert(response.data.message);
      getCities();
      getInactiveCities();
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this city? This can't be undone.")) return;
    try {
      const response = await axios.delete(`${signupApi}city/${id}`);
      alert(response.data.message);
      getCities();
      getInactiveCities();
    } catch (error) {
      console.log(error);
    }
  };

  const codeFor = (name = "") =>
    name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();

  // Filter and Sort Logic using debouncedSearch
  const filteredCities = useMemo(() => {
    let data = activeTab === "active" ? [...cities] : [...inactiveCities];

    if (debouncedSearch)
      data = data.filter((item) =>
        item.cityName.toLowerCase().includes(debouncedSearch.toLowerCase()),
      );
    if (districtFilter)
      data = data.filter((item) => item.districtId?._id === districtFilter);

    data.sort((a, b) =>
      sort === "asc"
        ? a.cityName.localeCompare(b.cityName)
        : b.cityName.localeCompare(a.cityName),
    );
    return data;
  }, [
    cities,
    inactiveCities,
    debouncedSearch,
    sort,
    districtFilter,
    activeTab,
  ]);

  // Paginated Data
  const paginatedCities = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCities.slice(start, start + itemsPerPage);
  }, [filteredCities, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredCities.length / itemsPerPage);

  const activeCount = cities.length;
  const inactiveCount = inactiveCities.length;

  return (
    <div className="p-6 md:p-8 bg-neutral-50 min-h-screen text-neutral-800 space-y-8 font-sans">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <span className="text-xs font-bold tracking-wider text-emerald-700 uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Location Hierarchy
          </span>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight mt-2">
            City Directory
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Manage, filter, and structure active and archived cities across
            districts.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-neutral-900 hover:bg-neutral-800 text-white h-11 px-5 rounded-xl font-medium text-sm inline-flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          <Plus size={18} />
          <span>Add New City</span>
        </button>
      </div>

      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Total Cities
            </p>
            <h3 className="text-2xl font-bold text-neutral-900 mt-1">
              {activeCount + inactiveCount}
            </h3>
          </div>
          <div className="w-12 h-12 bg-neutral-100 text-neutral-600 rounded-xl flex items-center justify-center">
            <Building2 size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
              Active Cities
            </p>
            <h3 className="text-2xl font-bold text-neutral-900 mt-1">
              {activeCount}
            </h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
              Inactive Cities
            </p>
            <h3 className="text-2xl font-bold text-neutral-900 mt-1">
              {inactiveCount}
            </h3>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <XCircle size={22} />
          </div>
        </div>
      </div>

      {/* Filter and Tab Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
        {/* Active/Inactive Switcher Tabs */}
        <div className="flex border-b border-neutral-100 pb-3 gap-2">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === "active"
                ? "bg-emerald-800 text-white shadow-sm"
                : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100"
            }`}
          >
            Active
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === "active"
                  ? "bg-emerald-900 text-emerald-100"
                  : "bg-neutral-100 text-neutral-600"
              }`}
            >
              {activeCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("inactive")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === "inactive"
                ? "bg-emerald-800 text-white shadow-sm"
                : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100"
            }`}
          >
            Inactive
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === "inactive"
                  ? "bg-emerald-900 text-emerald-100"
                  : "bg-neutral-100 text-neutral-600"
              }`}
            >
              {inactiveCount}
            </span>
          </button>
        </div>

        {/* Search & Select Filter Bar */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by city name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 pl-10 pr-4 h-10 rounded-xl text-sm outline-none focus:border-emerald-600 focus:bg-white transition text-neutral-800"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 md:w-52">
              <Filter
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                size={16}
              />
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 pl-9 pr-8 h-10 rounded-xl text-sm outline-none focus:border-emerald-600 focus:bg-white transition text-neutral-700 appearance-none cursor-pointer"
              >
                <option value="">All Districts</option>
                {districts.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.districtName}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative flex-1 md:w-44">
              <ArrowUpDown
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                size={16}
              />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 pl-9 pr-8 h-10 rounded-xl text-sm outline-none focus:border-emerald-600 focus:bg-white transition text-neutral-700 appearance-none cursor-pointer"
              >
                <option value="asc">Name (A to Z)</option>
                <option value="desc">Name (Z to A)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-3">
            <Loader2 className="animate-spin text-emerald-700" size={32} />
            <p className="text-xs text-neutral-400 font-medium tracking-wide uppercase">
              Fetching records...
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4 w-28">Code</th>
                  <th className="px-6 py-4">City Name</th>
                  <th className="px-6 py-4">District</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {paginatedCities.length > 0 ? (
                  paginatedCities.map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-neutral-50 transition-colors group"
                    >
                      {/* Code Badge */}
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                          {codeFor(item.cityName)}
                        </span>
                      </td>

                      {/* City Name */}
                      <td className="px-6 py-4 font-semibold text-neutral-900 text-sm capitalize">
                        {item.cityName}
                      </td>

                      {/* District */}
                      <td className="px-6 py-4 text-neutral-600 text-sm capitalize">
                        {item.districtId?.districtName || "N/A"}
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                            activeTab === "active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              activeTab === "active"
                                ? "bg-emerald-500"
                                : "bg-amber-500"
                            }`}
                          />
                          {activeTab === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="px-6 py-4">
                        <div className="flex justify-end items-center gap-1.5">
                          {activeTab === "active" ? (
                            <>
                              <button
                                onClick={() => handleView(item._id)}
                                className="p-2 rounded-lg text-neutral-500 hover:text-emerald-700 hover:bg-emerald-50 transition"
                                title="View Details"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-2 rounded-lg text-neutral-500 hover:text-emerald-700 hover:bg-emerald-50 transition"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleInactive(item._id)}
                                className="p-2 rounded-lg text-neutral-500 hover:text-amber-600 hover:bg-amber-50 transition"
                                title="Mark Inactive"
                              >
                                <Ban size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(item._id)}
                                className="p-2 rounded-lg text-neutral-500 hover:text-rose-600 hover:bg-rose-50 transition"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleRestore(item._id)}
                                className="p-2 rounded-lg text-neutral-500 hover:text-emerald-600 hover:bg-emerald-50 transition"
                                title="Restore"
                              >
                                <RotateCcw size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(item._id)}
                                className="p-2 rounded-lg text-neutral-500 hover:text-rose-600 hover:bg-rose-50 transition"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-16 text-neutral-400 text-sm"
                    >
                      No records found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && filteredCities.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-neutral-200 gap-4">
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <span>Showing</span>
              <span className="font-semibold text-neutral-800">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>
              <span>to</span>
              <span className="font-semibold text-neutral-800">
                {Math.min(currentPage * itemsPerPage, filteredCities.length)}
              </span>
              <span>of</span>
              <span className="font-semibold text-neutral-800">
                {filteredCities.length}
              </span>
              <span>results</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500">Rows per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="bg-neutral-50 border border-neutral-200 px-2 py-1 rounded-lg text-xs outline-none focus:border-emerald-600 cursor-pointer"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-neutral-600"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-semibold px-3 text-neutral-700">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-neutral-600"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-neutral-100 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <h2 className="text-lg font-bold text-neutral-900">
                {isEdit ? "Update City Details" : "Create New City"}
              </h2>
              <button
                onClick={resetForm}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wider">
                  City Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jodhpur"
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  autoFocus
                  className="w-full h-11 rounded-xl border border-neutral-200 px-4 text-sm outline-none focus:border-emerald-600 transition text-neutral-800 font-medium bg-neutral-50/50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wider">
                  District
                </label>
                <select
                  value={districtId}
                  onChange={(e) => setDistrictId(e.target.value)}
                  className="w-full h-11 rounded-xl border border-neutral-200 px-4 text-sm outline-none focus:border-emerald-600 transition text-neutral-800 font-medium bg-neutral-50/50 focus:bg-white cursor-pointer"
                >
                  <option value="">Select a district...</option>
                  {districts.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.districtName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={resetForm}
                className="h-10 px-5 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="h-10 px-5 rounded-xl text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 transition shadow-md"
              >
                {isEdit ? "Save Changes" : "Create City"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Data Modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-neutral-100 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <h2 className="text-lg font-bold text-neutral-900">
                City Overview
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-neutral-50 rounded-xl p-3.5 border border-neutral-100">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-0.5">
                  City Name
                </span>
                <span className="text-base font-bold text-neutral-900 capitalize">
                  {viewData?.cityName || "-"}
                </span>
              </div>

              <div className="bg-neutral-50 rounded-xl p-3.5 border border-neutral-100">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-0.5">
                  District Name
                </span>
                <span className="text-base font-bold text-neutral-900 capitalize">
                  {viewData?.districtId?.districtName || "-"}
                </span>
              </div>

              <div className="bg-neutral-50 rounded-xl p-3.5 border border-neutral-100">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-0.5">
                  Status
                </span>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${
                      viewData?.status === "active"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        viewData?.status === "active"
                          ? "bg-emerald-500"
                          : "bg-amber-500"
                      }`}
                    />
                    {viewData?.status || "Unknown"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowViewModal(false)}
                className="h-10 px-6 rounded-xl text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 transition"
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

export default City;

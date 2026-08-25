import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { signupApi } from "../api";
import useDebounce from "../hooks/useDebounce";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Ban,
  RotateCcw,
  Trash2,
  Loader2,
  MapPin,
  Layers,
  CheckCircle2,
  XCircle,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const District = () => {
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [activeTab, setActiveTab] = useState("active");

  const [districtName, setDistrictName] = useState("");
  const [stateId, setStateId] = useState("");
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [inactiveDistricts, setInactiveDistricts] = useState([]);
  const [viewData, setViewData] = useState(null);

  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState("");

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 1000); // Aapka banaya hua hook[cite: 4]

  const [filterState, setFilterState] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(false);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    getStates();
    getDistricts();
    getInactiveDistricts();
  }, []);

  // Reset page to 1 when tab, search, filters, or rows per page change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, debouncedSearch, filterState, sortOrder, itemsPerPage]);

  const getStates = async () => {
    try {
      const response = await axios.get(`${signupApi}state/active`);
      setStates(response.data.result || []);
    } catch (error) {
      console.error("Error fetching states:", error);
    }
  };

  const getDistricts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${signupApi}district/active`);
      setDistricts(response.data.result || []);
    } catch (error) {
      console.error("Error fetching active districts:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInactiveDistricts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${signupApi}district/inactive`);
      setInactiveDistricts(response.data.result || []);
    } catch (error) {
      console.error("Error fetching inactive districts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!districtName.trim() || !stateId) {
      return alert("District name and State are required");
    }
    try {
      const endpoint = isEdit ? `district/update/${editId}` : `district/create`;
      const method = isEdit ? axios.patch : axios.post;

      const response = await method(`${signupApi}${endpoint}`, {
        districtName,
        stateId,
      });

      alert(response.data.message);
      resetForm();
      getDistricts();
      getInactiveDistricts();
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  const resetForm = () => {
    setDistrictName("");
    setStateId("");
    setShowModal(false);
    setIsEdit(false);
    setEditId("");
  };

  const handleView = async (id) => {
    try {
      const response = await axios.get(`${signupApi}district/${id}`);
      setViewData(response.data.result);
      setShowViewModal(true);
    } catch (error) {
      console.error("Error fetching district detail:", error);
    }
  };

  const handleEdit = (item) => {
    setIsEdit(true);
    setEditId(item._id);
    setDistrictName(item.districtName);
    setStateId(item.stateId?._id || "");
    setShowModal(true);
  };

  const handleInactive = async (id) => {
    try {
      const response = await axios.patch(`${signupApi}district/inactive/${id}`);
      alert(response.data.message);
      getDistricts();
      getInactiveDistricts();
    } catch (error) {
      console.error("Error deactivating district:", error);
    }
  };

  const handleRestore = async (id) => {
    try {
      const response = await axios.patch(`${signupApi}district/restore/${id}`);
      alert(response.data.message);
      getDistricts();
      getInactiveDistricts();
    } catch (error) {
      console.error("Error restoring district:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this district? This action cannot be undone."))
      return;
    try {
      const response = await axios.delete(`${signupApi}district/${id}`);
      alert(response.data.message);
      getDistricts();
      getInactiveDistricts();
    } catch (error) {
      console.error("Error deleting district:", error);
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
  const filteredData = useMemo(() => {
    const currentData = activeTab === "active" ? districts : inactiveDistricts;

    return currentData
      .filter((item) => {
        const districtMatch = item.districtName
          ?.toLowerCase()
          .includes(debouncedSearch.toLowerCase());
        const stateMatch =
          filterState === "" ? true : item.stateId?._id === filterState;
        return districtMatch && stateMatch;
      })
      .sort((a, b) => {
        const nameA = a.districtName || "";
        const nameB = b.districtName || "";
        return sortOrder === "asc"
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      });
  }, [
    activeTab,
    districts,
    inactiveDistricts,
    debouncedSearch,
    filterState,
    sortOrder,
  ]);

  // Paginated Data
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const activeCount = districts.length;
  const inactiveCount = inactiveDistricts.length;
  const totalCount = activeCount + inactiveCount;

  return (
    <div className="p-6 md:p-8 bg-[#FAF6F0] min-h-screen text-[#2D1B10] font-sans space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E8DCCF] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#F4ECE1] text-[#8C4A27] rounded-md">
              <MapPin size={16} />
            </span>
            <span className="text-[11px] font-bold tracking-widest text-[#8C4A27] uppercase">
              Location Management
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#3D2314] tracking-tight">
            Districts Overview
          </h1>
          <p className="text-sm text-[#7C6354]">
            Manage and organize regional administrative districts grouped by
            state.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-[#5C321E] hover:bg-[#4A2616] text-[#FAF6F0] px-5 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <Plus size={18} />
          <span>Add New District</span>
        </button>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#E8DCCF] flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-[#7C6354] uppercase tracking-wider">
              Total Records
            </p>
            <p className="text-2xl font-bold text-[#3D2314] mt-1">
              {totalCount}
            </p>
          </div>
          <div className="p-3 bg-[#F4ECE1] text-[#5C321E] rounded-xl">
            <Layers size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E8DCCF] flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-[#7C6354] uppercase tracking-wider">
              Active Districts
            </p>
            <p className="text-2xl font-bold text-[#2D5A37] mt-1">
              {activeCount}
            </p>
          </div>
          <div className="p-3 bg-[#E8F3EA] text-[#2D5A37] rounded-xl">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E8DCCF] flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-[#7C6354] uppercase tracking-wider">
              Inactive Districts
            </p>
            <p className="text-2xl font-bold text-[#9E3B22] mt-1">
              {inactiveCount}
            </p>
          </div>
          <div className="p-3 bg-[#FDEEEB] text-[#9E3B22] rounded-xl">
            <XCircle size={22} />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#E8DCCF] gap-6">
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "active"
              ? "border-[#8C4A27] text-[#8C4A27]"
              : "border-transparent text-[#7C6354] hover:text-[#3D2314]"
          }`}
        >
          Active Districts
          <span className="bg-[#F4ECE1] text-[#8C4A27] text-xs px-2 py-0.5 rounded-full font-bold">
            {activeCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("inactive")}
          className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "inactive"
              ? "border-[#8C4A27] text-[#8C4A27]"
              : "border-transparent text-[#7C6354] hover:text-[#3D2314]"
          }`}
        >
          Inactive Districts
          <span className="bg-[#F4ECE1] text-[#7C6354] text-xs px-2 py-0.5 rounded-full font-bold">
            {inactiveCount}
          </span>
        </button>
      </div>

      {/* Filter and Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A08878]"
              size={18}
            />
            <input
              type="text"
              placeholder="Search district..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-[#E8DCCF] pl-10 pr-4 h-10 rounded-xl text-sm outline-none focus:border-[#8C4A27] focus:ring-1 focus:ring-[#8C4A27] transition text-[#3D2314] placeholder-[#A08878] shadow-sm"
            />
          </div>

          {/* State Filter */}
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="w-full sm:w-48 bg-white border border-[#E8DCCF] px-3 h-10 rounded-xl text-sm font-medium outline-none focus:border-[#8C4A27] transition text-[#3D2314] cursor-pointer shadow-sm"
          >
            <option value="">All States</option>
            {states.map((item) => (
              <option key={item._id} value={item._id}>
                {item.stateName}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Order */}
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="w-full sm:w-40 bg-white border border-[#E8DCCF] px-3 h-10 rounded-xl text-sm font-medium outline-none focus:border-[#8C4A27] transition text-[#3D2314] cursor-pointer shadow-sm"
        >
          <option value="asc">Sort A to Z</option>
          <option value="desc">Sort Z to A</option>
        </select>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-[#E8DCCF] rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-3">
            <Loader2 className="animate-spin text-[#8C4A27]" size={32} />
            <p className="text-xs font-semibold text-[#8C4A27] uppercase tracking-wider">
              Loading Districts Data...
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F4EE] border-b border-[#E8DCCF]">
                  <th className="text-[11px] font-bold text-[#7C6354] uppercase tracking-wider px-6 py-4 w-28">
                    Code
                  </th>
                  <th className="text-[11px] font-bold text-[#7C6354] uppercase tracking-wider px-6 py-4">
                    District Name
                  </th>
                  <th className="text-[11px] font-bold text-[#7C6354] uppercase tracking-wider px-6 py-4">
                    State
                  </th>
                  <th className="text-[11px] font-bold text-[#7C6354] uppercase tracking-wider px-6 py-4">
                    Status
                  </th>
                  <th className="text-[11px] font-bold text-[#7C6354] uppercase tracking-wider px-6 py-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E6DC]">
                {paginatedData.length > 0 ? (
                  paginatedData.map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-[#FAF6F0] transition-colors"
                    >
                      {/* Code Badge */}
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold bg-[#F4ECE1] text-[#8C4A27] py-1 px-2.5 rounded-lg border border-[#E2D2C1]">
                          {codeFor(item.districtName)}
                        </span>
                      </td>

                      {/* District Name */}
                      <td className="px-6 py-4 font-semibold text-[#3D2314] text-sm capitalize">
                        {item.districtName}
                      </td>

                      {/* State Name */}
                      <td className="px-6 py-4 text-[#7C6354] text-sm capitalize">
                        {item.stateId?.stateName || "-"}
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4">
                        {activeTab === "active" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#E8F3EA] text-[#2D5A37]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A37]" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#FDEEEB] text-[#9E3B22]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#9E3B22]" />
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {activeTab === "active" ? (
                            <>
                              <button
                                onClick={() => handleView(item._id)}
                                className="p-2 rounded-lg text-[#7C6354] hover:text-[#5C321E] hover:bg-[#F4ECE1] transition cursor-pointer"
                                title="View Details"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-2 rounded-lg text-[#7C6354] hover:text-[#5C321E] hover:bg-[#F4ECE1] transition cursor-pointer"
                                title="Edit District"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleInactive(item._id)}
                                className="p-2 rounded-lg text-[#7C6354] hover:text-[#D97706] hover:bg-[#FEF3C7] transition cursor-pointer"
                                title="Mark Inactive"
                              >
                                <Ban size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(item._id)}
                                className="p-2 rounded-lg text-[#7C6354] hover:text-[#DC2626] hover:bg-[#FEE2E2] transition cursor-pointer"
                                title="Delete District"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleRestore(item._id)}
                                className="p-2 rounded-lg text-[#7C6354] hover:text-[#2D5A37] hover:bg-[#E8F3EA] transition cursor-pointer"
                                title="Restore District"
                              >
                                <RotateCcw size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(item._id)}
                                className="p-2 rounded-lg text-[#7C6354] hover:text-[#DC2626] hover:bg-[#FEE2E2] transition cursor-pointer"
                                title="Delete District"
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
                      className="text-center py-16 text-[#A08878] text-sm"
                    >
                      No districts found matching your query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && filteredData.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-[#E8DCCF] gap-4 bg-white">
            <div className="flex items-center gap-2 text-sm text-[#7C6354]">
              <span>Showing</span>
              <span className="font-semibold text-[#3D2314]">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>
              <span>to</span>
              <span className="font-semibold text-[#3D2314]">
                {Math.min(currentPage * itemsPerPage, filteredData.length)}
              </span>
              <span>of</span>
              <span className="font-semibold text-[#3D2314]">
                {filteredData.length}
              </span>
              <span>results</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#7C6354]">Rows per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="bg-[#FAF6F0] border border-[#E8DCCF] px-2 py-1 rounded-lg text-xs outline-none focus:border-[#8C4A27] cursor-pointer text-[#3D2314]"
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
                  className="p-2 rounded-lg border border-[#E8DCCF] hover:bg-[#FAF6F0] disabled:opacity-40 disabled:cursor-not-allowed transition text-[#7C6354] cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-semibold px-3 text-[#3D2314]">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-2 rounded-lg border border-[#E8DCCF] hover:bg-[#FAF6F0] disabled:opacity-40 disabled:cursor-not-allowed transition text-[#7C6354] cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#2D1B10]/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#E8DCCF] rounded-2xl p-6 md:p-8 w-full max-w-md shadow-xl space-y-6 relative">
            <div className="flex items-center justify-between border-b border-[#E8DCCF] pb-4">
              <h2 className="text-xl font-bold text-[#3D2314]">
                {isEdit ? "Edit District" : "Add New District"}
              </h2>
              <button
                onClick={resetForm}
                className="text-[#A08878] hover:text-[#3D2314] p-1 rounded-lg transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#7C6354] uppercase tracking-wider mb-2">
                  District Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jaipur"
                  value={districtName}
                  onChange={(e) => setDistrictName(e.target.value)}
                  autoFocus
                  className="w-full h-11 rounded-xl border border-[#E8DCCF] px-4 text-sm outline-none focus:border-[#8C4A27] focus:ring-1 focus:ring-[#8C4A27] transition text-[#3D2314] font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#7C6354] uppercase tracking-wider mb-2">
                  Select State
                </label>
                <select
                  value={stateId}
                  onChange={(e) => setStateId(e.target.value)}
                  className="w-full h-11 rounded-xl border border-[#E8DCCF] px-4 text-sm outline-none focus:border-[#8C4A27] focus:ring-1 focus:ring-[#8C4A27] transition text-[#3D2314] font-medium bg-white cursor-pointer"
                >
                  <option value="">Select a state...</option>
                  {states.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.stateName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={resetForm}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#7C6354] bg-[#F4ECE1] hover:bg-[#E8DCCF] hover:text-[#3D2314] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#FAF6F0] bg-[#5C321E] hover:bg-[#4A2616] transition shadow-sm cursor-pointer"
              >
                {isEdit ? "Save Changes" : "Create District"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-[#2D1B10]/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#E8DCCF] rounded-2xl p-6 md:p-8 w-full max-w-sm shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#E8DCCF] pb-4">
              <h2 className="text-xl font-bold text-[#3D2314]">
                District Details
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-[#A08878] hover:text-[#3D2314] p-1 rounded-lg transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#E8DCCF]">
                <p className="text-[10px] font-bold tracking-wider text-[#8C4A27] uppercase mb-1">
                  District Name
                </p>
                <p className="text-base text-[#3D2314] font-bold capitalize">
                  {viewData?.districtName || "-"}
                </p>
              </div>

              <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#E8DCCF]">
                <p className="text-[10px] font-bold tracking-wider text-[#8C4A27] uppercase mb-1">
                  State
                </p>
                <p className="text-base text-[#3D2314] font-bold capitalize">
                  {viewData?.stateId?.stateName || "-"}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowViewModal(false)}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-[#FAF6F0] bg-[#5C321E] hover:bg-[#4A2616] transition shadow-sm cursor-pointer"
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

export default District;

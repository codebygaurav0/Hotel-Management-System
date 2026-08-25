import React, { useEffect, useState } from "react";
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
  X,
} from "lucide-react";

const State = () => {
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [activeTab, setActiveTab] = useState("active");

  const [stateName, setStateName] = useState("");
  const [states, setStates] = useState([]);
  const [inactiveStates, setInactiveStates] = useState([]);
  const [viewData, setViewData] = useState(null);

  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState("");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Debounce hook use kiya hai (500ms delay)
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    if (activeTab === "active") {
      getStates();
    } else {
      getInactiveStates();
    }
  }, [activeTab, debouncedSearch, sortOrder, page]);

  const getStates = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${signupApi}state/active`, {
        params: { search: debouncedSearch, sort: sortOrder, page, limit },
      });
      setStates(response.data.result || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getInactiveStates = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${signupApi}state/inactive`, {
        params: { search: debouncedSearch, sort: sortOrder, page, limit },
      });
      setInactiveStates(response.data.result || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!stateName.trim()) return alert("State name is required");
    try {
      const endpoint = isEdit ? `state/update/${editId}` : `state/create`;
      const method = isEdit ? axios.patch : axios.post;

      const response = await method(`${signupApi}${endpoint}`, { stateName });
      alert(response.data.message);

      resetForm();
      if (activeTab === "active") getStates();
      else getInactiveStates();
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleView = async (id) => {
    try {
      const response = await axios.get(`${signupApi}state/${id}`);
      setViewData(response.data.result);
      setShowViewModal(true);
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleEdit = (item) => {
    setIsEdit(true);
    setEditId(item._id);
    setStateName(item.stateName);
    setShowModal(true);
  };

  const handleInactive = async (id) => {
    try {
      const response = await axios.patch(`${signupApi}state/inactive/${id}`);
      alert(response.data.message);
      if (activeTab === "active") getStates();
      else getInactiveStates();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRestore = async (id) => {
    try {
      const response = await axios.patch(`${signupApi}state/restore/${id}`);
      alert(response.data.message);
      if (activeTab === "active") getStates();
      else getInactiveStates();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this state? This action cannot be undone."))
      return;
    try {
      const response = await axios.delete(`${signupApi}state/${id}`);
      alert(response.data.message);
      if (activeTab === "active") getStates();
      else getInactiveStates();
    } catch (error) {
      console.error(error);
    }
  };

  const resetForm = () => {
    setStateName("");
    setShowModal(false);
    setIsEdit(false);
    setEditId("");
  };

  const codeFor = (name = "") =>
    name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();

  const currentData = activeTab === "active" ? states : inactiveStates;
  const activeCount = states.length;
  const inactiveCount = inactiveStates.length;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 font-sans text-neutral-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <span className="text-[11px] font-bold tracking-widest text-emerald-700 uppercase bg-emerald-50 px-2.5 py-1 rounded-md">
            Location Hierarchy
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mt-2">
            States Overview
          </h1>
          <p className="text-neutral-500 text-sm mt-1">Manage regional states</p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-emerald-700 to-amber-500 hover:opacity-90 text-white h-10 px-5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-emerald-700/20 active:scale-[0.98]"
        >
          <Plus size={18} />
          Add State
        </button>
      </div>

      {/* Navigation & Search Bar Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex bg-neutral-100 p-1 rounded-xl w-fit border border-neutral-200">
          <button
            onClick={() => {
              setActiveTab("active");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "active"
                ? "bg-emerald-700 text-white shadow-sm"
                : "text-neutral-600 hover:text-emerald-700"
            }`}
          >
            Active Records
          </button>

          <button
            onClick={() => {
              setActiveTab("inactive");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "inactive"
                ? "bg-emerald-700 text-white shadow-sm"
                : "text-neutral-600 hover:text-emerald-700"
            }`}
          >
            Inactive Records
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search states..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-white border border-neutral-300 pl-9 pr-4 h-10 rounded-lg text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition text-neutral-800 shadow-sm"
            />
          </div>

          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-40 bg-white border border-neutral-300 px-3 h-10 rounded-lg text-sm font-medium outline-none focus:border-emerald-600 transition text-neutral-700 cursor-pointer shadow-sm"
          >
            <option value="asc">Sort A to Z</option>
            <option value="desc">Sort Z to A</option>
          </select>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-3">
            <Loader2 className="animate-spin text-emerald-700" size={32} />
            <p className="text-xs font-semibold text-neutral-500 tracking-wider uppercase">
              Loading Data...
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider px-6 py-3.5 w-28">
                    Code
                  </th>
                  <th className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider px-6 py-3.5">
                    State Name
                  </th>
                  <th className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider px-6 py-3.5">
                    Status
                  </th>
                  <th className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider px-6 py-3.5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-sm">
                {currentData.length > 0 ? (
                  currentData.map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-emerald-50/40 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md">
                          {codeFor(item.stateName)}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-semibold text-neutral-900 capitalize">
                        {item.stateName}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            activeTab === "active"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${activeTab === "active" ? "bg-emerald-600" : "bg-neutral-400"}`}
                          />
                          {activeTab === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-1.5">
                          {activeTab === "active" ? (
                            <>
                              <button
                                onClick={() => handleView(item._id)}
                                className="p-2 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 transition"
                                title="View"
                              >
                                <Eye size={15} />
                              </button>
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-2 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 transition"
                                title="Edit"
                              >
                                <Edit size={15} />
                              </button>
                              <button
                                onClick={() => handleInactive(item._id)}
                                className="p-2 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 transition"
                                title="Mark Inactive"
                              >
                                <Ban size={15} />
                              </button>
                              <button
                                onClick={() => handleDelete(item._id)}
                                className="p-2 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-200 transition"
                                title="Delete"
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleRestore(item._id)}
                                className="p-2 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 transition"
                                title="Restore"
                              >
                                <RotateCcw size={15} />
                              </button>
                              <button
                                onClick={() => handleDelete(item._id)}
                                className="p-2 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-200 transition"
                                title="Delete"
                              >
                                <Trash2 size={15} />
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
                      colSpan={4}
                      className="text-center py-12 text-neutral-400 text-sm"
                    >
                      No states found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 bg-neutral-50">
          <span className="text-xs font-medium text-neutral-500">
            Page <span className="font-bold text-neutral-700">{page}</span> of{" "}
            <span className="font-bold text-neutral-700">{totalPages || 1}</span>
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-300 bg-white text-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-100 transition"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-300 bg-white text-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-100 transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={resetForm}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 p-1 rounded-lg hover:bg-neutral-100"
            >
              <X size={18} />
            </button>

            <h2 className="text-xl font-bold text-neutral-900 mb-5">
              {isEdit ? "Edit State Detail" : "Add New State"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-2">
                  State Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Maharashtra"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  autoFocus
                  className="w-full h-11 rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition text-neutral-900"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="h-10 px-4 rounded-lg text-sm font-semibold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-emerald-700 to-amber-500 hover:opacity-90 transition shadow-md shadow-emerald-700/10"
                >
                  {isEdit ? "Save Changes" : "Create State"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowViewModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 p-1 rounded-lg hover:bg-neutral-100"
            >
              <X size={18} />
            </button>

            <h2 className="text-xl font-bold text-neutral-900 mb-4">
              State Information
            </h2>

            <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-200/60 mb-6">
              <span className="text-[10px] font-bold tracking-widest text-emerald-700 uppercase block mb-1">
                State Name
              </span>
              <p className="text-lg text-neutral-900 font-bold capitalize">
                {viewData?.stateName}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="h-10 px-5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-emerald-700 to-amber-500 hover:opacity-90 transition shadow-md"
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

export default State;
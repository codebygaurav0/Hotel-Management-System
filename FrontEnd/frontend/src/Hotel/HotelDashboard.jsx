import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { signupApi } from "../api";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Toaster, toast } from "sonner";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  CalendarCheck,
  Wallet,
  Star,
  LogIn,
  LogOut,
  TrendingUp,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import CountUpModule from "react-countup";
const CountUp = CountUpModule.default || CountUpModule;

import useDebounce from "../hooks/useDebounce";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.8, 0.25, 1] },
  },
};

const statusColorMap = {
  Confirmed: "bg-emerald-500/10 text-emerald-700 border-emerald-300/50",
  "Checked In": "bg-amber-500/10 text-amber-700 border-amber-300/50",
  Pending: "bg-orange-500/10 text-orange-700 border-orange-300/50",
  Completed: "bg-slate-500/10 text-slate-700 border-slate-300/50",
  Cancelled: "bg-rose-500/10 text-rose-700 border-rose-300/50",
};

const HotelDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [timeRange, setTimeRange] = useState("30d");

  // Search, Sort, & Pagination States
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookingsCount, setTotalBookingsCount] = useState(0);

  const debouncedSearch = useDebounce(searchTerm, 1000);

  // Reset page when search term changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const fetchDashboardData = useCallback(
    async (isManualRefresh = false) => {
      try {
        if (isManualRefresh) setRefreshing(true);
        else setLoading(true);

        setErrorMsg("");
        const token = localStorage.getItem("token");

        if (!token) {
          setErrorMsg("Session expired. Please log in again.");
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/dashboard/summary`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              search: debouncedSearch,
              sortBy,
              sortOrder,
              page,
              limit,
            },
          },
        );
        if (response.data?.success) {
          setDashboardData(response.data);
          if (response.data.pagination) {
            setTotalPages(response.data.pagination.totalPages || 1);
            setTotalBookingsCount(response.data.pagination.totalBookings || 0);
          } else if (response.data.recentBookings) {
            setTotalBookingsCount(response.data.recentBookings.length);
          }
          if (isManualRefresh) toast.success("Dashboard metrics updated!");
        } else {
          setErrorMsg("Failed to parse dashboard analytics.");
        }
      } catch (err) {
        console.error("Dashboard API Fetch Error:", err);
        setErrorMsg(
          err.response?.data?.message ||
            "Could not synchronize with backend clusters.",
        );
        toast.error("Data sync failed");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [debouncedSearch, sortBy, sortOrder, page, limit],
  );

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const {
    monthlyRevenue = [],
    recentBookings = [],
    ratingSummary = {
      averageRating: 0,
      totalReviews: 0,
      categories: { cleanliness: 0, staff: 0, location: 0, valueForMoney: 0 },
    },
    summary = {},
  } = dashboardData || {};

  const columns = useMemo(
    () => [
      {
        header: "Booking ID",
        accessorKey: "bookingId",
        cell: (info) => (
          <span className="font-mono text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            #{info.getValue() || "BK-000"}
          </span>
        ),
      },
      {
        header: "Guest Name",
        accessorKey: "userId.name",
        cell: (info) => (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-900 text-emerald-300 flex items-center justify-center text-xs font-bold shadow-xs">
              {(info.getValue() || "G")[0]}
            </div>
            <span className="font-medium text-slate-800">
              {info.getValue() || "Guest User"}
            </span>
          </div>
        ),
      },
      {
        header: "Room Type",
        accessorKey: "roomId.roomType",
        cell: (info) => (
          <span className="text-slate-600 font-medium">
            {info.getValue() || "Standard Suite"}
          </span>
        ),
      },
      {
        header: "Room No",
        accessorKey: "roomId.roomNumber",
        cell: (info) => (
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
            Room {info.getValue() || "101"}
          </span>
        ),
      },
      {
        header: "Check-In",
        accessorKey: "checkIn",
        cell: (info) => (
          <span className="text-slate-500 text-xs font-medium">
            {dayjs(info.getValue()).format("DD MMM YYYY")}
          </span>
        ),
      },
      {
        header: "Status",
        accessorKey: "bookingStatus",
        cell: (info) => {
          const status = info.getValue() || "Pending";
          const color =
            statusColorMap[status] ||
            "bg-slate-100 text-slate-700 border-slate-200";
          return (
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-xs ${color}`}
            >
              {status}
            </span>
          );
        },
      },
      {
        header: "Amount",
        accessorKey: "finalAmount",
        cell: (info) => (
          <span className="font-bold text-slate-900 tracking-tight text-sm">
            ₹{(info.getValue() || 0).toLocaleString()}
          </span>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: recentBookings,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true,
  });

  const kpiCards = useMemo(
    () => [
      {
        title: "New Bookings",
        value: summary.todayBookings || 0,
        trend: "+8.7%",
        trendUp: true,
        color: "text-emerald-700",
        bg: "bg-emerald-50 border-emerald-200",
        icon: CalendarCheck,
      },
      {
        title: "Check-Ins Today",
        value: summary.todayCheckIns || 0,
        trend: "+3.5%",
        trendUp: true,
        color: "text-blue-700",
        bg: "bg-blue-50 border-blue-200",
        icon: LogIn,
      },
      {
        title: "Check-Outs Today",
        value: summary.todayCheckOuts || 0,
        trend: "-1.0%",
        trendUp: false,
        color: "text-rose-700",
        bg: "bg-rose-50 border-rose-200",
        icon: LogOut,
      },
      {
        title: "Total Revenue",
        value: summary.todayRevenue || 0,
        prefix: "₹",
        trend: "+12.4%",
        trendUp: true,
        color: "text-slate-900",
        bg: "bg-slate-100 border-slate-200",
        icon: Wallet,
      },
    ],
    [summary],
  );

  if (errorMsg) {
    return (
      <div className="flex h-full min-h-[450px] items-center justify-center p-6 bg-slate-50">
        <div className="border border-rose-200 rounded-2xl p-8 text-center bg-white max-w-md shadow-xl backdrop-blur-lg">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={24} />
          </div>
          <h3 className="font-bold text-xl mb-2 text-slate-900">
            Sync Interrupted
          </h3>
          <p className="text-sm text-slate-500 mb-6">{errorMsg}</p>
          <button
            onClick={() => fetchDashboardData()}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" richColors />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6 w-full pb-12 max-w-[1600px] mx-auto text-slate-800 font-sans"
      >
        {/* HEADER SECTION */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs gap-4 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase tracking-widest border border-emerald-200">
                Real-time Overview
              </span>
              <Sparkles size={14} className="text-emerald-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Hotel Analytics Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Monitor live performance metrics, occupancy, and guest satisfaction.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end relative z-10">
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-600">
              {["7d", "30d", "1y"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 rounded-xl transition-all capitalize cursor-pointer ${
                    timeRange === range
                      ? "bg-slate-900 text-white shadow-xs"
                      : "hover:text-slate-900"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            <button
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-2xl shadow-xs transition active:scale-95 flex items-center justify-center shrink-0 cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin text-emerald-600" : ""}
              />
            </button>
          </div>
        </motion.div>

        {/* METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {kpiCards.map((kpi, index) => {
            const IconComponent = kpi.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="bg-white p-5 rounded-3xl shadow-xs border border-slate-200 flex flex-col justify-between relative overflow-hidden group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      {kpi.title}
                    </p>
                    {loading ? (
                      <Skeleton width={90} height={32} borderRadius={8} />
                    ) : (
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        {kpi.prefix}
                        <CountUp end={kpi.value} duration={1.8} separator="," />
                      </h3>
                    )}
                  </div>
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${kpi.bg} ${kpi.color} shadow-xs group-hover:scale-105 transition-transform duration-300`}
                  >
                    <IconComponent size={22} />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full font-bold text-[11px] ${
                      kpi.trendUp
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                        : "bg-rose-50 text-rose-700 border border-rose-200/60"
                    }`}
                  >
                    <TrendingUp
                      size={12}
                      className={kpi.trendUp ? "" : "rotate-180"}
                    />
                    {kpi.trend}
                  </span>
                  <span className="text-slate-400 font-medium">
                    vs past cycle
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <motion.div
            variants={itemVariants}
            className="bg-white p-6 rounded-3xl shadow-xs border border-slate-200 lg:col-span-2 flex flex-col justify-between"
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">
                  Revenue Yield Analytics
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Financial trajectory & monthly earnings
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                FY 2026
              </span>
            </div>
            {loading ? (
              <Skeleton height={240} borderRadius={16} />
            ) : (
              <div className="h-[250px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={monthlyRevenue}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="emeraldGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#059669"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="95%"
                          stopColor="#059669"
                          stopOpacity={0.0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      dy={8}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      tickFormatter={(val) => `₹${val / 1000}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderRadius: "12px",
                        border: "none",
                        color: "#fff",
                        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3)",
                        fontSize: "12px",
                      }}
                      itemStyle={{ color: "#e2e8f0" }}
                      formatter={(value) => [
                        `₹${value.toLocaleString()}`,
                        "Revenue",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#059669"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#emeraldGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white p-6 rounded-3xl shadow-xs border border-slate-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-extrabold text-slate-900 text-lg">
                  Guest Rating
                </h3>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {ratingSummary.totalReviews} reviews
                </span>
              </div>

              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-5">
                <div className="bg-slate-900 text-emerald-400 px-3.5 py-2.5 rounded-xl font-black text-xl flex items-center gap-1 shadow-sm shrink-0">
                  {ratingSummary.averageRating}{" "}
                  <Star size={16} className="fill-amber-400 text-amber-400" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">
                    Exceptional
                  </h4>
                  <p className="text-xs text-slate-500">
                    Based on verified stay logs
                  </p>
                </div>
              </div>

              <div className="space-y-3.5">
                {[
                  {
                    label: "Cleanliness",
                    val: ratingSummary.categories.cleanliness,
                  },
                  {
                    label: "Staff Service",
                    val: ratingSummary.categories.staff,
                  },
                  { label: "Location", val: ratingSummary.categories.location },
                  {
                    label: "Value for Money",
                    val: ratingSummary.categories.valueForMoney,
                  },
                ].map((cat, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                      <span>{cat.label}</span>
                      <span className="font-bold text-slate-900">
                        {cat.val}/5
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${(cat.val / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* RECENT RESERVATIONS TABLE */}
        <motion.div
          variants={itemVariants}
          className="bg-white p-6 rounded-3xl shadow-xs border border-slate-200 overflow-hidden flex flex-col space-y-4"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                Live Reservations
              </h3>
              <p className="text-xs text-slate-500">
                Real-time room booking logs managed with external useDebounce hook
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search by guest, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                />
              </div>

              <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
                <ArrowUpDown size={14} className="text-slate-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="createdAt">Date Created</option>
                  <option value="checkIn">Check-In Date</option>
                  <option value="finalAmount">Amount</option>
                </select>
                <button
                  onClick={() =>
                    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                  }
                  className="text-[10px] font-bold uppercase bg-white px-2 py-0.5 rounded border border-slate-300 shadow-xs text-emerald-700 cursor-pointer"
                  title="Toggle Direction"
                >
                  {sortOrder}
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              <Skeleton count={4} height={48} borderRadius={12} />
            </div>
          ) : recentBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <CalendarCheck size={40} className="text-slate-300 mb-2" />
              <p className="text-slate-500 text-sm font-semibold">
                No matching reservations found.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50/70 text-slate-500 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th key={header.id} className="px-4 py-3.5 font-bold">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="text-slate-700 divide-y divide-slate-100">
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3.5">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && recentBookings.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-100 gap-4 text-xs font-medium text-slate-500">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-800 font-semibold focus:outline-none cursor-pointer"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
                <span className="ml-2">
                  Total items:{" "}
                  <strong className="text-slate-800">
                    {totalBookingsCount}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span>
                  Page <strong className="text-slate-800">{page}</strong> of{" "}
                  <strong className="text-slate-800">{totalPages}</strong>
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 disabled:opacity-40 hover:bg-slate-100 transition cursor-pointer"
                    title="First Page"
                  >
                    <ChevronsLeft size={14} />
                  </button>
                  <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 disabled:opacity-40 hover:bg-slate-100 transition cursor-pointer"
                    title="Previous Page"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() =>
                      setPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 disabled:opacity-40 hover:bg-slate-100 transition cursor-pointer"
                    title="Next Page"
                  >
                    <ChevronRight size={14} />
                  </button>
                  <button
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 disabled:opacity-40 hover:bg-slate-100 transition cursor-pointer"
                    title="Last Page"
                  >
                    <ChevronsRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </>
  );
};

export default HotelDashboard;
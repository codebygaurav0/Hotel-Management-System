import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { signupApi } from "../api";
import { motion } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Toaster, toast } from "sonner";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  Building2,
  Users,
  CalendarCheck,
  Wallet,
  Star,
  ShieldCheck,
  TrendingUp,
  Search,
  Eye,
  X,
  Plus,
  Hotel,
  Ticket,
  ChevronRight,
  Filter,
  PieChart as PieIcon,
  BarChart3,
  Activity,
  MapPin,
} from "lucide-react";

import CountUpModule from "react-countup";
import useDebounce from "../hooks/useDebounce"; // Custom Debounce Hook Import

const CountUp = CountUpModule.default || CountUpModule;

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const statusColorMap = {
  Approved: "bg-emerald-50 text-emerald-800 border-emerald-200",
  Pending: "bg-amber-50 text-amber-800 border-amber-200",
  Rejected: "bg-rose-50 text-rose-800 border-rose-200",
};

// Modern Earthy Luxury Palette
const CHART_PALETTE = ["#8C5E32", "#2D1E18", "#D4A373", "#A67C52", "#C05621"];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [pendingHotels, setPendingHotels] = useState([]);
  const [approvedHotels, setApprovedHotels] = useState([]);
  const [rejectedHotels, setRejectedHotels] = useState([]);

  const [platformAnalytics, setPlatformAnalytics] = useState({
    monthlyRevenue: [],
    bookingTrend: [],
    bookingStatusBreakdown: [],
    hotelsByCity: [],
    topPerformingHotels: [],
    occupancyComparison: [],
    newRegistrations: [],
    kpis: {},
  });

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400); // 400ms ka debounce delay

  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("city");
  const [cityFilter, setCityFilter] = useState("");

  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showView, setShowView] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      const [pending, approved, rejected] = await Promise.all([
        axios.get(`${signupApi}hotel/pending`, { headers }),
        axios.get(`${signupApi}hotel/approved`, { headers }),
        axios.get(`${signupApi}hotel/rejected`, { headers }),
      ]);

      setPendingHotels(pending.data.hotels || []);
      setApprovedHotels(approved.data.hotels || []);
      setRejectedHotels(rejected.data.hotels || []);

      try {
        const analyticsRes = await axios.get(
          `${signupApi}dashboard/platform-analytics`,
          { headers },
        );
        if (analyticsRes.data?.success) {
          setPlatformAnalytics(analyticsRes.data.analytics);
        }
      } catch (analyticErr) {
        console.log("Analytics endpoint fallback triggered.");
      }
    } catch (error) {
      console.error("Dashboard fetching error:", error);
      toast.error("Failed to load dashboard listings.");
    } finally {
      setLoading(false);
    }
  };

  const allHotels = useMemo(() => {
    const map = new Map();
    [...pendingHotels, ...approvedHotels, ...rejectedHotels].forEach(
      (hotel) => {
        map.set(hotel._id, hotel);
      },
    );
    return [...map.values()];
  }, [pendingHotels, approvedHotels, rejectedHotels]);

  const filteredHotels = useMemo(() => {
    let data = [...allHotels];

    if (statusFilter !== "All") {
      data = data.filter((hotel) => hotel.status === statusFilter);
    }

    if (cityFilter) {
      data = data.filter((hotel) => hotel.city?._id === cityFilter);
    }

    // Using debouncedSearch instead of instant search
    if (debouncedSearch.trim()) {
      const searchLower = debouncedSearch.toLowerCase();
      data = data.filter(
        (hotel) =>
          hotel.hotelName?.toLowerCase().includes(searchLower) ||
          hotel.hotelEmail?.toLowerCase().includes(searchLower) ||
          hotel.adminId?.name?.toLowerCase().includes(searchLower) ||
          hotel.city?.cityName?.toLowerCase().includes(searchLower),
      );
    }

    data.sort((a, b) => {
      if (sortBy === "city") {
        const cityA = a.city?.cityName || "";
        const cityB = b.city?.cityName || "";
        return cityA.localeCompare(cityB);
      }
      if (sortBy === "latest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    return data;
  }, [allHotels, debouncedSearch, statusFilter, sortBy, cityFilter]);

  const stats = useMemo(() => {
    const totalRoomsCalc = allHotels.reduce(
      (acc, h) => acc + (Number(h.totalRooms) || 0),
      0,
    );
    return {
      total: allHotels.length,
      pending: pendingHotels.length,
      approved: approvedHotels.length,
      rejected: rejectedHotels.length,
      totalRooms: platformAnalytics.kpis?.totalRooms || totalRoomsCalc || 0,
      totalBookings: platformAnalytics.kpis?.totalBookings || 0,
      totalCustomers: platformAnalytics.kpis?.totalCustomers || 0,
      activeOwners: platformAnalytics.kpis?.activeOwners || allHotels.length,
      averageRating: platformAnalytics.kpis?.averageRating || 0,
      occupancyRate: platformAnalytics.kpis?.occupancyRate || 0,
      totalRevenue: platformAnalytics.kpis?.totalRevenue || 0,
    };
  }, [
    allHotels,
    pendingHotels,
    approvedHotels,
    rejectedHotels,
    platformAnalytics,
  ]);

  const handleView = (hotel) => {
    setSelectedHotel(hotel);
    setShowView(true);
  };

  const handleEdit = (id) => {
    navigate(`/admin/addHotel?id=${id}`);
  };

  const monthlyRevenue = platformAnalytics.monthlyRevenue || [];
  const bookingTrend = platformAnalytics.bookingTrend || [];
  const bookingStatusData = platformAnalytics.bookingStatusBreakdown || [];

  const totalPieBookings = useMemo(() => {
    return bookingStatusData.reduce((acc, curr) => acc + (curr.value || 0), 0);
  }, [bookingStatusData]);

  const hotelsByCityData = useMemo(() => {
    if (platformAnalytics.hotelsByCity?.length > 0)
      return platformAnalytics.hotelsByCity;
    const cityCounts = {};
    allHotels.forEach((h) => {
      const cityName = h.city?.cityName || "Unassigned";
      cityCounts[cityName] = (cityCounts[cityName] || 0) + 1;
    });
    return Object.entries(cityCounts).map(([city, count]) => ({ city, count }));
  }, [allHotels, platformAnalytics]);

  const kpiCards = useMemo(
    () => [
      {
        title: "Total Properties",
        value: stats.total,
        trend: "+8.4%",
        trendUp: true,
        icon: Building2,
      },
      {
        title: "Total Room Stock",
        value: stats.totalRooms,
        trend: "+12.1%",
        trendUp: true,
        icon: Hotel,
      },
      {
        title: "Total Bookings",
        value: stats.totalBookings,
        trend: "+15.3%",
        trendUp: true,
        icon: CalendarCheck,
      },
      {
        title: "Total Guest Accounts",
        value: stats.totalCustomers,
        trend: "+9.2%",
        trendUp: true,
        icon: Users,
      },
      {
        title: "Gross Revenue",
        value: stats.totalRevenue,
        prefix: "₹",
        trend: "+14.5%",
        trendUp: true,
        icon: Wallet,
      },
      {
        title: "Average Guest Rating",
        value: stats.averageRating,
        trend: "+0.2",
        trendUp: true,
        icon: Star,
      },
      {
        title: "Occupancy Rate",
        value: stats.occupancyRate,
        suffix: "%",
        trend: "+4.1%",
        trendUp: true,
        icon: TrendingUp,
      },
      {
        title: "Active Admins",
        value: stats.activeOwners,
        trend: "+6",
        trendUp: true,
        icon: ShieldCheck,
      },
    ],
    [stats],
  );

  const columns = useMemo(
    () => [
      {
        header: "Hotel Name",
        accessorKey: "hotelName",
        cell: (info) => (
          <span className="font-bold text-[#2D1E18]">{info.getValue()}</span>
        ),
      },
      {
        header: "City / Location",
        accessorKey: "city.cityName",
        cell: (info) => (
          <span className="text-[#5C4A3E]">{info.getValue() || "N/A"}</span>
        ),
      },
      {
        header: "Assigned Manager",
        accessorKey: "adminId.name",
        cell: (info) => (
          <span className="text-[#5C4A3E]">{info.getValue() || "Admin"}</span>
        ),
      },
      {
        header: "Rooms",
        accessorKey: "totalRooms",
        cell: (info) => (
          <span className="px-2.5 py-0.5 rounded-md bg-[#F3ECE4] text-[#8C5E32] text-xs font-bold border border-[#E4DCD3]">
            {info.getValue() || 0}
          </span>
        ),
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: (info) => {
          const status = info.getValue();
          const color =
            statusColorMap[status] ||
            "bg-gray-100 text-gray-700 border-gray-200";
          return (
            <span
              className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${color}`}
            >
              {status}
            </span>
          );
        },
      },
      {
        header: "Actions",
        accessorKey: "_id",
        cell: (info) => {
          const hotel = info.row.original;
          return (
            <div className="flex gap-2">
              <button
                onClick={() => handleView(hotel)}
                className="px-3 py-1.5 bg-[#2D1E18] text-[#FAF5EF] rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-[#1E130E] transition cursor-pointer"
              >
                View
              </button>
              <button
                onClick={() => handleEdit(hotel._id)}
                className="px-3 py-1.5 bg-white border border-[#E4DCD3] text-[#5C4A3E] rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-[#F3ECE4] transition cursor-pointer"
              >
                Edit
              </button>
            </div>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: filteredHotels,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="min-h-screen bg-[#F8F5EE] py-6 px-4 sm:px-6">
      <Toaster position="top-right" richColors />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6 w-full max-w-[1400px] mx-auto text-[#2D1E18] font-['Inter',sans-serif]"
      >
        {/* Header Console Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-6 rounded-xl border border-[#E4DCD3] shadow-xs gap-4">
          <div>
            <span className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-[#8C5E32] uppercase tracking-widest">
              MANAGEMENT CONSOLE
            </span>
            <h1 className="text-2xl font-bold font-['Space_Grotesk'] text-[#2D1E18] tracking-tight">
              Super Admin Dashboard
            </h1>
            <p className="text-xs text-[#7A6B5D] font-medium">
              Real-time platform overview across listings, reservations, and
              earnings.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/addHotel")}
              className="bg-[#2D1E18] hover:bg-[#1E130E] text-[#FAF5EF] px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus size={15} className="text-[#D4A373]" /> Add Property
            </button>
            <button
              onClick={() => navigate("/admin/addCoupon")}
              className="bg-white hover:bg-[#F3ECE4] border border-[#E4DCD3] text-[#5C4A3E] px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Ticket size={15} className="text-[#8C5E32]" /> Add Coupon
            </button>
          </div>
        </div>

        {/* 8 KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((kpi, index) => {
            const IconComponent = kpi.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white p-5 rounded-xl border border-[#E4DCD3] shadow-xs flex flex-col justify-between"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-[10px] font-bold text-[#8C5E32] uppercase tracking-widest mb-1 font-['IBM_Plex_Mono']">
                      {kpi.title}
                    </p>
                    {loading ? (
                      <Skeleton width={80} height={28} />
                    ) : (
                      <h3 className="text-2xl font-bold text-[#2D1E18] tracking-tight font-['Space_Grotesk']">
                        {kpi.prefix}
                        <CountUp end={kpi.value} duration={2} separator="," />
                        {kpi.suffix}
                      </h3>
                    )}
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-[#F8F5EE] border border-[#E4DCD3] flex items-center justify-center shrink-0 text-[#8C5E32]">
                    <IconComponent size={18} />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs border-t border-[#F3ECE4] pt-2.5">
                  <span
                    className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded font-bold text-[11px] ${
                      kpi.trendUp
                        ? "bg-emerald-50 text-emerald-800"
                        : "bg-rose-50 text-rose-800"
                    }`}
                  >
                    <TrendingUp
                      size={11}
                      className={kpi.trendUp ? "" : "rotate-180"}
                    />
                    {kpi.trend}
                  </span>
                  <span className="text-[#A8988B] text-[11px]">
                    vs last month
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* --- CHARTS GRID REDESIGN --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* 1. AREA CHART: Financial Revenue Flow */}
          <motion.div
            variants={itemVariants}
            className="bg-white p-6 rounded-2xl border border-[#E4DCD3] shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-[#8C5E32] uppercase tracking-wider">
                  FINANCIAL FLOW
                </span>
                <h3 className="font-bold text-[#2D1E18] text-base font-['Space_Grotesk']">
                  Revenue Trajectory
                </h3>
              </div>
              <div className="p-2.5 bg-[#FCFAF7] border border-[#E4DCD3] rounded-xl text-[#8C5E32]">
                <Activity size={18} />
              </div>
            </div>

            <div className="h-[230px] w-full">
              {monthlyRevenue.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-[#A8988B]">
                  No revenue metrics logged
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={monthlyRevenue}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="revenueGradientNew"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#8C5E32"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor="#8C5E32"
                          stopOpacity={0.0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="4 4"
                      vertical={false}
                      stroke="#EBE4DD"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#7A6B5D", fontWeight: 500 }}
                      dy={8}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#7A6B5D" }}
                      tickFormatter={(val) => `₹${val / 100000}L`}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #E4DCD3",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
                        fontSize: "12px",
                        backgroundColor: "#FFF",
                        fontWeight: "bold",
                      }}
                      formatter={(value) => [
                        `₹${(value / 100000).toFixed(2)} Lakhs`,
                        "Monthly Revenue",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8C5E32"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#revenueGradientNew)"
                      dot={{
                        r: 4,
                        fill: "#8C5E32",
                        strokeWidth: 2,
                        stroke: "#FFF",
                      }}
                      activeDot={{
                        r: 6,
                        fill: "#2D1E18",
                        stroke: "#FFF",
                        strokeWidth: 2,
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* 2. BAR CHART: Daily Reservation Volume */}
          <motion.div
            variants={itemVariants}
            className="bg-white p-6 rounded-2xl border border-[#E4DCD3] shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-[#8C5E32] uppercase tracking-wider">
                  BOOKING ACTIVITY
                </span>
                <h3 className="font-bold text-[#2D1E18] text-base font-['Space_Grotesk']">
                  Daily Reservation Count
                </h3>
              </div>
              <div className="p-2.5 bg-[#FCFAF7] border border-[#E4DCD3] rounded-xl text-[#2D1E18]">
                <BarChart3 size={18} />
              </div>
            </div>

            <div className="h-[230px] w-full">
              {bookingTrend.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-[#A8988B]">
                  No reservation trend available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={bookingTrend}
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="4 4"
                      vertical={false}
                      stroke="#EBE4DD"
                    />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#7A6B5D", fontWeight: 500 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#7A6B5D" }}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(140, 94, 50, 0.05)" }}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #E4DCD3",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
                        fontSize: "12px",
                      }}
                    />
                    <Bar
                      dataKey="bookings"
                      fill="#2D1E18"
                      radius={[6, 6, 0, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* 3. DONUT CHART: Booking Status Ratio */}
          <motion.div
            variants={itemVariants}
            className="bg-white p-6 rounded-2xl border border-[#E4DCD3] shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-[#8C5E32] uppercase tracking-wider">
                  STATUS RATIO
                </span>
                <h3 className="font-bold text-[#2D1E18] text-base font-['Space_Grotesk']">
                  Reservation Distribution
                </h3>
              </div>
              <div className="p-2.5 bg-[#FCFAF7] border border-[#E4DCD3] rounded-xl text-[#8C5E32]">
                <PieIcon size={18} />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 my-auto pt-2">
              {bookingStatusData.length === 0 ? (
                <div className="w-full text-center text-xs text-[#A8988B] py-10">
                  No booking distribution metrics found
                </div>
              ) : (
                <>
                  <div className="relative h-[175px] w-[175px] flex items-center justify-center shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={bookingStatusData}
                          innerRadius={52}
                          outerRadius={78}
                          paddingAngle={6}
                          dataKey="value"
                          stroke="none"
                          cornerRadius={6}
                        >
                          {bookingStatusData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={CHART_PALETTE[index % CHART_PALETTE.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: "10px",
                            border: "1px solid #E4DCD3",
                            fontSize: "12px",
                            boxShadow: "0 10px 20px rgba(0,0,0,0.06)",
                          }}
                          formatter={(value) => [`${value} Bookings`, "Count"]}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="absolute text-center flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl font-black text-[#2D1E18] font-['Space_Grotesk'] leading-none">
                        {totalPieBookings}
                      </span>
                      <span className="text-[9px] font-bold text-[#8C5E32] uppercase tracking-widest mt-1 font-['IBM_Plex_Mono']">
                        Total
                      </span>
                    </div>
                  </div>

                  <div className="w-full space-y-2.5">
                    {bookingStatusData.map((item, idx) => {
                      const color = CHART_PALETTE[idx % CHART_PALETTE.length];
                      const percentage = totalPieBookings
                        ? ((item.value / totalPieBookings) * 100).toFixed(1)
                        : 0;

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-[#F3ECE4] bg-[#FCFAF7] hover:bg-[#F8F5EE] transition-all"
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                              style={{ backgroundColor: color }}
                            ></span>
                            <span className="text-xs font-semibold text-[#2D1E18]">
                              {item.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-bold text-[#2D1E18]">
                              {item.value}
                            </span>
                            <span className="text-[10px] font-bold text-[#8C5E32] bg-[#F3ECE4] px-2 py-0.5 rounded-md border border-[#E4DCD3]">
                              {percentage}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* 4. BAR CHART: City Location Breakdown */}
          <motion.div
            variants={itemVariants}
            className="bg-white p-6 rounded-2xl border border-[#E4DCD3] shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-[#8C5E32] uppercase tracking-wider">
                  GEOGRAPHIC SPREAD
                </span>
                <h3 className="font-bold text-[#2D1E18] text-base font-['Space_Grotesk']">
                  Hotels by Location
                </h3>
              </div>
              <div className="p-2.5 bg-[#FCFAF7] border border-[#E4DCD3] rounded-xl text-[#8C5E32]">
                <MapPin size={18} />
              </div>
            </div>

            <div className="h-[180px] w-full">
              {hotelsByCityData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-[#A8988B]">
                  No city data found
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={hotelsByCityData}
                    margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="4 4"
                      vertical={false}
                      stroke="#EBE4DD"
                    />
                    <XAxis
                      dataKey="city"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#7A6B5D" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#7A6B5D" }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #E4DCD3",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
                        fontSize: "12px",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#8C5E32"
                      radius={[6, 6, 0, 0]}
                      barSize={22}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>
        </div>

        {/* Hotel Data Table Section */}
        <div className="bg-white p-6 rounded-xl border border-[#E4DCD3] shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-[#8C5E32] uppercase tracking-wider">
                LISTINGS DIRECTORY
              </span>
              <h2 className="text-lg font-bold font-['Space_Grotesk'] text-[#2D1E18]">
                Hotel Property Inventory
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8988B]"
                  size={15}
                />
                <input
                  type="text"
                  placeholder="Search hotel or city..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#FCFAF7] border border-[#E4DCD3] rounded-lg text-xs outline-none focus:border-[#8C5E32] transition"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-[#FCFAF7] border border-[#E4DCD3] rounded-lg text-xs font-semibold text-[#5C4A3E] outline-none focus:border-[#8C5E32] cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* TanStack Table View */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F5EE] text-[#8C5E32] uppercase font-['IBM_Plex_Mono'] text-[10px] tracking-wider border-b border-[#E4DCD3]">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="py-3 px-4 font-bold">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-[#F3ECE4]">
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="py-8 text-center text-[#A8988B]"
                    >
                      No hotel records found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-[#FCFAF7] transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="py-3 px-4 text-[#2D1E18]">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Property Details View Modal */}
      {showView && selectedHotel && (
        <div className="fixed inset-0 z-50 bg-[#2D1E18]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-[550px] w-full p-6 shadow-xl border border-[#E4DCD3] relative">
            <button
              onClick={() => setShowView(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#7A6B5D] hover:text-[#2D1E18] hover:bg-[#F8F5EE] transition cursor-pointer"
            >
              <X size={18} />
            </button>
            <span className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-[#8C5E32] uppercase tracking-wider">
              PROPERTY SPECIFICATION
            </span>
            <h2 className="text-xl font-bold font-['Space_Grotesk'] text-[#2D1E18] mb-1">
              {selectedHotel.hotelName}
            </h2>
            <p className="text-xs text-[#7A6B5D] mb-4">
              {selectedHotel.city?.cityName || "Location Unspecified"}
            </p>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#FCFAF7] border border-[#E4DCD3] rounded-lg">
                <strong className="block text-[#2D1E18] mb-0.5">
                  Email Contact:
                </strong>
                <span className="text-[#5C4A3E]">
                  {selectedHotel.hotelEmail || "N/A"}
                </span>
              </div>
              <div className="p-3 bg-[#FCFAF7] border border-[#E4DCD3] rounded-lg">
                <strong className="block text-[#2D1E18] mb-0.5">
                  Total Room Count:
                </strong>
                <span className="text-[#5C4A3E]">
                  {selectedHotel.totalRooms || 0} Units
                </span>
              </div>
              <div className="p-3 bg-[#FCFAF7] border border-[#E4DCD3] rounded-lg">
                <strong className="block text-[#2D1E18] mb-0.5">
                  Overview & Description:
                </strong>
                <p className="text-[#5C4A3E] leading-relaxed">
                  {selectedHotel.description || "No description provided."}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowView(false)}
              className="mt-5 w-full py-2.5 bg-[#2D1E18] text-[#FAF5EF] font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#1E130E] transition cursor-pointer"
            >
              Close Dialog
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

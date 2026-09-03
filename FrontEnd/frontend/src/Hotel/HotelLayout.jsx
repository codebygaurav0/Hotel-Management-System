
import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  LayoutDashboard,
  BedDouble,
  UserCircle,
  CalendarCheck,
  ShieldCheck,
  LogOut,
  Hotel,
  Bell,
  MapPin,
  Menu,
  X,
} from "lucide-react";

const HotelLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch (error) {
    console.error("Error parsing user data:", error);
  }

  const menuItems = [
    {
      name: "Dashboard",
      path: "hotelDashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Bookings",
      path: "hotelBookings",
      icon: CalendarCheck,
    },
    {
      name: "All Rooms",
      path: "allRooms",
      icon: BedDouble,
    },
    {
      name: "Profile",
      path: "hotelProfile",
      icon: UserCircle,
    },
  ];

  const handleLogout = () => {
    if (!window.confirm("Are you sure you want to securely end your session?")) {
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setMobileMenuOpen(false);
    navigate("/login");
  };

  const initials = (name) => {
    return (name || "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("");
  };

  const getPageTitle = () => {
    if (location.pathname.includes("hotelDashboard")) {
      return "Analytics & Overview";
    }

    if (location.pathname.includes("hotelBookings")) {
      return "Guest Reservations";
    }

    if (location.pathname.includes("allRooms")) {
      return "Room Inventory Management";
    }

    if (location.pathname.includes("hotelProfile")) {
      return "Hotel Profile Settings";
    }

    return "Management Console";
  };

  return (
    <div className="flex h-screen bg-[#faf7f2] font-sans text-stone-800 overflow-hidden selection:bg-[#8c6d53] selection:text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600&display=swap');

        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* ================= DESKTOP SIDEBAR ================= */}

      <aside className="w-64 bg-white/90 backdrop-blur-md border-r border-[#e8dfd5] flex-col shrink-0 hidden lg:flex z-20 relative shadow-sm">
        {/* Brand Logo Header */}

        <div className="h-20 flex items-center px-6 border-b border-[#f0eae1]">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate("/hotel/hotelDashboard")}
          >
            <div className="w-9 h-9 rounded-2xl bg-[#3d2e24] flex items-center justify-center text-amber-200 shadow-md group-hover:scale-105 transition-transform duration-200">
              <Hotel size={19} />
            </div>

            <div className="overflow-hidden">
              <span className="font-extrabold text-base tracking-tight text-[#2d241e] block truncate">
                {user?.name || "Luxstay"}
              </span>

              <span className="text-[10px] text-[#8c6d53] font-bold uppercase tracking-widest block font-mono">
                Luxstay Hotel Management
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}

        <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <p className="text-[10px] tracking-widest text-stone-400 mb-3 px-3 font-bold uppercase font-mono">
            Main Portal
          </p>

          {menuItems.map((item) => {
            const active = location.pathname.includes(item.path);
            const IconComponent = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-200 font-semibold text-sm ${
                  active
                    ? "bg-[#3d2e24] text-amber-50 shadow-md font-bold"
                    : "text-stone-600 hover:bg-[#f8f5f0] hover:text-[#2d241e]"
                }`}
              >
                <IconComponent
                  size={19}
                  className={
                    active ? "text-amber-300" : "text-stone-400"
                  }
                />

                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Desktop Bottom Actions */}

        <div className="p-4 border-t border-[#f0eae1] space-y-1.5 bg-[#fcfaf7]/50">
          <Link
            to="/reset"
            className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-stone-600 hover:bg-white hover:shadow-xs rounded-xl transition border border-transparent hover:border-[#e8dfd5]"
          >
            <ShieldCheck size={17} className="text-[#8c6d53]" />
            Reset Password
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-xl transition border border-transparent hover:border-rose-100"
          >
            <LogOut size={17} />
            End Session
          </button>
        </div>
      </aside>

      {/* ================= MOBILE SIDEBAR ================= */}

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[9999] lg:hidden flex">
          {/* Overlay */}

          <div
            className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Mobile Sidebar */}

          <aside className="w-[280px] max-w-[85vw] bg-white h-full shadow-2xl relative z-20 flex flex-col">
            {/* Mobile Sidebar Header */}

            <div className="h-20 flex items-center justify-between px-5 border-b border-[#e8dfd5] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#3d2e24] flex items-center justify-center text-amber-200">
                  <Hotel size={18} />
                </div>

                <span className="font-extrabold text-base tracking-tight text-stone-900">
                  Navigation Menu
                </span>
              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center p-2 text-stone-500 hover:bg-stone-100 rounded-lg cursor-pointer"
                aria-label="Close navigation menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile Navigation */}

            <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
              {menuItems.map((item) => {
                const active = location.pathname.includes(item.path);
                const IconComponent = item.icon;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-semibold text-sm ${
                      active
                        ? "bg-[#3d2e24] text-amber-50 shadow-md"
                        : "text-stone-600 hover:bg-[#f8f5f0]"
                    }`}
                  >
                    <IconComponent
                      size={18}
                      className={
                        active ? "text-amber-300" : "text-stone-400"
                      }
                    />

                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Logout */}

            <div className="p-4 border-t border-[#e8dfd5] shrink-0">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-xl transition cursor-pointer"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ================= MAIN CONTENT ================= */}

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header */}

        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#e8dfd5] flex items-center justify-between px-4 sm:px-8 shrink-0 z-10">
          {/* Left: Mobile Toggle + Page Title */}

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="relative z-50 flex items-center justify-center p-2.5 text-stone-600 bg-white hover:bg-stone-100 rounded-xl lg:hidden border border-stone-200 cursor-pointer shadow-sm"
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu size={22} />
            </button>

            <div>
              <h1 className="text-lg sm:text-2xl font-black text-[#2d241e] tracking-tight">
                {getPageTitle()}
              </h1>

              <p className="text-xs text-stone-500 font-medium tracking-wide hidden sm:block">
                {dayjs().format("dddd, DD MMMM YYYY")}
              </p>
            </div>
          </div>

          {/* Right: Notifications + Profile */}

          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-3 sm:gap-4 pl-2 sm:pl-6 sm:border-l border-[#e8dfd5]">
              {/* Notification */}

              <button
                type="button"
                className="relative p-2.5 text-stone-600 hover:text-stone-900 transition rounded-xl hover:bg-[#f8f5f0] border border-stone-200/80"
                aria-label="Notifications"
              >
                <Bell size={18} />

                <span className="absolute top-2 right-2 w-2 h-2 bg-amber-600 rounded-full ring-2 ring-white" />
              </button>

              {/* User Avatar */}

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-stone-900 truncate max-w-[150px]">
                    {user?.name || "Hotel Manager"}
                  </p>

                  <p className="text-[10px] text-[#8c6d53] font-bold tracking-wider uppercase flex items-center justify-end gap-1 mt-0.5 font-mono">
                    <MapPin size={10} className="text-[#8c6d53]" />
                    Property Admin
                  </p>
                </div>

                <div className="w-9 h-9 rounded-2xl bg-[#3d2e24] text-amber-200 flex items-center justify-center font-bold shadow-sm text-xs shrink-0 border border-[#2d241e]">
                  {initials(user?.name) || "HM"}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 scrollbar-hide bg-[#faf7f2]">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default HotelLayout;


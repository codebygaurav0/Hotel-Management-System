import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Ticket,
  UserCircle,
  CalendarCheck,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
} from "lucide-react";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch (error) {
    console.error("Error parsing user data:", error);
  }

  const menu = [
    { name: "Dashboard", path: "dashboard", icon: LayoutDashboard },
    { name: "Add Hotel", path: "addHotel", icon: Building2 },
    { name: "My Coupon", path: "myCoupon", icon: Ticket },
    { name: "Profile", path: "profile", icon: UserCircle },
    { name: "Hotel Bookings", path: "adminBookings", icon: CalendarCheck },
  ];

  const handleLogout = () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    localStorage.clear();
    navigate("/login");
  };

  const initials = (name) =>
    (name || "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("");

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-800 flex flex-col md:flex-row antialiased">
      {/* ------------------------------------------------------------- */}
      {/* MOBILE TOP BAR */}
      {/* ------------------------------------------------------------- */}
      <div className="md:hidden bg-white text-neutral-900 px-5 py-4 flex items-center justify-between sticky top-0 z-50 border-b border-neutral-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white font-bold text-sm flex items-center justify-center">
            {initials(user?.name) || "A"}
          </div>
          <div>
            <h1 className="font-bold text-sm text-neutral-900 leading-none">
              Admin Core
            </h1>
            <span className="text-[10px] text-emerald-700 font-mono tracking-wider uppercase font-semibold">
              Workspace
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-neutral-100 text-neutral-600 hover:text-neutral-900 transition"
          aria-label="Toggle Navigation"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SIDEBAR NAVIGATION (Desktop & Mobile Drawer) */}
      {/* ------------------------------------------------------------- */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-72 bg-white text-neutral-700 flex flex-col justify-between z-40 transition-transform duration-300 ease-in-out shrink-0 border-r border-neutral-200/80 shadow-xs ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          {/* Brand Logo & Details */}
          <div className="p-6 border-b border-neutral-100 hidden md:block">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-700 to-amber-500 text-white font-extrabold text-base flex items-center justify-center shadow-md shadow-emerald-700/10">
                {initials(user?.name) || "A"}
              </div>
              <div>
                <h1 className="font-bold text-base text-neutral-900 tracking-tight">
                  Admin Core
                </h1>
                <p className="text-[10px] font-mono tracking-widest text-emerald-700 font-semibold uppercase mt-0.5">
                  WORKSPACE NODE
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 sm:p-5 space-y-1.5 overflow-y-auto max-h-[calc(100vh-220px)]">
            <p className="px-3 text-[10px] font-mono tracking-widest text-neutral-400 uppercase font-bold mb-3">
              Main Menu
            </p>

            {menu.map((item) => {
              const active = location.pathname.includes(`/admin/${item.path}`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 group ${
                    active
                      ? "bg-emerald-700 text-white shadow-sm border border-emerald-700"
                      : "text-neutral-600 hover:bg-neutral-100/80 hover:text-neutral-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={18}
                      className={`transition-colors ${
                        active
                          ? "text-amber-300"
                          : "text-neutral-400 group-hover:text-neutral-700"
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {active && (
                    <ChevronRight size={14} className="text-amber-300" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 sm:p-5 border-t border-neutral-100 bg-neutral-50/50 space-y-2">
          <Link
            to="/reset"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full h-9 rounded-lg text-xs font-bold text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-200 shadow-xs transition flex items-center justify-center gap-2"
          >
            <ShieldCheck size={15} className="text-emerald-700" />
            Reset Password
          </Link>

          <button
            onClick={handleLogout}
            className="w-full h-9 rounded-lg text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <LogOut size={15} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Backdrop for Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs z-30 md:hidden"
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* MAIN CONTENT AREA */}
      {/* ------------------------------------------------------------- */}
      <main className="flex-1 flex flex-col min-w-0 max-h-screen overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col max-w-7xl mx-auto w-full space-y-6">
          {/* Top Header Banner */}
          <header className="bg-white rounded-xl border border-neutral-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-700 uppercase block mb-1">
                System Control Center
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
                Welcome Back, {user?.name || "Administrator"}
              </h2>
              <p className="text-neutral-500 text-xs mt-1">
                Manage your hotels, monitor user bookings, and configure
                settings.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-500 hover:text-neutral-800 transition cursor-pointer relative">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600"></span>
              </div>

              <div className="flex items-center gap-3 bg-neutral-50 border border-neutral-200 p-1.5 pr-3 rounded-lg">
                <div className="w-8 h-8 rounded-md bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                  {initials(user?.name) || "AD"}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-neutral-900 leading-tight">
                    {user?.name || "Admin"}
                  </p>
                  <p className="text-[10px] font-mono text-neutral-400">
                    Superadmin
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Child Outlet View Container */}
          <div className="flex-1 rounded-xl border border-neutral-200/80 bg-white p-4 sm:p-6 shadow-xs">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  Map,
  Building2,
  Hotel,
  UserCheck,
  KeyRound,
  LogOut,
  Bell,
  Search,
  PanelLeftClose,
  PanelLeft,
  Shield,
  Menu,
  X,
} from "lucide-react";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  React.useEffect(() => {
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

  const menu = [
    {
      name: "Dashboard",
      path: "dashboard",
      scale: "lg",
      icon: LayoutDashboard,
    },
    { name: "State", path: "state", scale: "lg", icon: MapPin },
    { name: "District", path: "district", scale: "md", icon: Map },
    { name: "City", path: "city", scale: "sm", icon: Building2 },
    {
      name: "Hotels Request",
      path: "pendingHotels",
      scale: "sm",
      icon: Hotel,
      badge: "New",
    },
    {
      name: "Admin Request",
      path: "pendingAdmin",
      scale: "sm",
      icon: UserCheck,
    },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const dotSize = { lg: "w-2.5 h-2.5", md: "w-2 h-2", sm: "w-1.5 h-1.5" };

  return (
    <div className="min-h-screen flex font-['Inter',sans-serif] bg-white text-neutral-800 bg-[radial-gradient(900px_420px_at_100%_-10%,rgba(4,120,87,0.06),transparent_60%)]">
      {/* Custom Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');`}</style>

      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-emerald-900 bg-emerald-950 px-4 md:hidden">
        <span className="font-['Space_Grotesk'] text-sm font-bold text-white">Super Admin</span>
        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="rounded-lg p-2 text-emerald-100 hover:bg-emerald-900"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Sidebar - Deep Emerald Header */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen bg-emerald-950 text-emerald-100 border-r border-emerald-900 flex w-[280px] flex-col justify-between transition-transform duration-300 md:relative md:z-20 md:translate-x-0 md:flex-shrink-0 md:transition-[width] ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } ${
          isSidebarCollapsed ? "md:w-[80px]" : "md:w-[280px]"
        }`}
      >
        <div>
          {/* Brand Section */}
          <div className="h-20 px-6 border-b border-emerald-900 flex items-center justify-between">
            <div className="flex items-center gap-3.5 overflow-hidden">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white font-['Space_Grotesk'] text-lg font-bold flex items-center justify-center shadow-lg shadow-amber-500/20 flex-shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              {!isSidebarCollapsed && (
                <div className="whitespace-nowrap">
                  <h1 className="font-['Space_Grotesk'] text-[17px] font-bold text-white tracking-tight">
                    Super Admin
                  </h1>
                  <p className="font-['IBM_Plex_Mono'] text-[9px] font-semibold tracking-[0.2em] text-amber-400 mt-0.5">
                    WORKSPACE
                  </p>
                </div>
              )}
            </div>

            {/* Collapse Button */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="text-emerald-300 hover:text-white p-1.5 rounded-lg hover:bg-emerald-900 transition"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isSidebarCollapsed ? (
                <PanelLeft className="w-5 h-5" />
              ) : (
                <PanelLeftClose className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="p-4">
            {!isSidebarCollapsed && (
              <p className="font-['IBM_Plex_Mono'] text-[10px] tracking-[0.15em] text-emerald-300/70 px-3 mb-4 font-semibold uppercase">
                Location Hierarchy
              </p>
            )}

            <div className="relative pl-1">
              {/* Vertical Hierarchy Line */}
              {!isSidebarCollapsed && (
                <div className="absolute left-[16.5px] top-3 bottom-3 w-px bg-emerald-900" />
              )}

              <div className="flex flex-col gap-1.5">
                {menu.map((item) => {
                  const active = location.pathname.includes(item.path);
                  const IconComponent = item.icon;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`relative flex items-center gap-3.5 py-2.5 px-3 transition-all duration-200 rounded-xl group ${
                        active
                          ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold shadow-md shadow-amber-500/25"
                          : "text-emerald-200/70 hover:bg-emerald-900 hover:text-white"
                      }`}
                    >
                      {/* Dot Indicator */}
                      {!isSidebarCollapsed && (
                        <span
                          className={`relative z-10 rounded-full flex-shrink-0 transition-colors ${
                            dotSize[item.scale]
                          } ${
                            active
                              ? "bg-white ring-4 ring-amber-500"
                              : "bg-emerald-800 group-hover:bg-emerald-600"
                          }`}
                        />
                      )}

                      {/* Menu Icon */}
                      <IconComponent
                        className={`w-4 h-4 flex-shrink-0 transition-colors ${
                          active
                            ? "text-white"
                            : "text-emerald-300 group-hover:text-amber-400"
                        }`}
                      />

                      {/* Menu Text */}
                      {!isSidebarCollapsed && (
                        <span className="text-[13.5px] whitespace-nowrap flex-1">
                          {item.name}
                        </span>
                      )}

                      {/* Badge (Hotels Request) */}
                      {!isSidebarCollapsed && item.badge && (
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            active
                              ? "bg-white/20 text-white"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}

                      {/* Tooltip on Collapsed State */}
                      {isSidebarCollapsed && (
                        <div className="absolute left-full ml-3 px-3 py-1.5 bg-emerald-900 text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30 shadow-xl border border-emerald-800">
                          {item.name}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-emerald-900 flex flex-col gap-2">
          {/* Reset Password */}
          <button
            onClick={() => navigate("/reset-password")}
            className="w-full h-10 rounded-xl text-[13px] font-semibold text-emerald-200 hover:bg-emerald-900 hover:text-white transition-all flex items-center justify-center gap-2.5 border border-emerald-900"
          >
            <KeyRound className="w-4 h-4 text-emerald-300" />
            {!isSidebarCollapsed && <span>Reset Password</span>}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full h-10 rounded-xl text-[13px] font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-200 transition-all flex items-center justify-center gap-2.5 border border-rose-900/60"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            {!isSidebarCollapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-neutral-950/40 md:hidden"
        />
      )}

      {/* Main Content Area */}
      <main className="min-w-0 flex-1 p-4 pt-20 md:p-10 md:pt-10 overflow-x-hidden flex flex-col">
        {/* Header Bar */}
        <header className="flex justify-between items-end mb-8">
          <div>
            <p className="font-['IBM_Plex_Mono'] text-[10px] font-semibold tracking-[0.2em] text-emerald-700 mb-2 uppercase">
              Overview
            </p>
            <h1 className="font-['Space_Grotesk'] text-[28px] font-bold text-neutral-900 tracking-tight">
              Welcome, Super Admin
            </h1>
            <p className="text-neutral-500 mt-1 text-[14px]">
              Manage states, districts and cities from one place.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Box */}
            <div className="hidden md:flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-neutral-200 text-neutral-500 focus-within:border-emerald-600 transition shadow-sm">
              <Search className="w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent text-xs text-neutral-900 outline-none placeholder:text-neutral-400 w-40"
              />
            </div>

            {/* Notification Bell */}
            <button className="relative p-2.5 bg-white border border-neutral-200 text-neutral-700 rounded-xl hover:bg-neutral-100 transition shadow-sm">
              <Bell className="w-4 h-4 text-neutral-700" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-600 rounded-full ring-2 ring-white"></span>
            </button>

            {/* Profile Avatar Badge */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-700 to-amber-500 text-white font-['Space_Grotesk'] font-bold border border-emerald-700/30 shadow-md shadow-emerald-700/15 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
              SA
            </div>
          </div>
        </header>

        {/* Dynamic Content Outlet Wrapper */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-8 min-h-[520px] flex-1 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
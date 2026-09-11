import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Hotel, Heart, ShieldCheck, Compass } from "lucide-react";

const UserLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-['Inter',sans-serif] flex flex-col justify-between selection:bg-emerald-600 selection:text-white">
      {/* Main Dynamic Page Content */}
      <main className="min-w-0 flex-grow">
        <Outlet />
      </main>

      {/* Luxury Light Modern Footer */}
      <footer id="site-footer" className="bg-white text-neutral-500 pt-16 pb-10 border-t border-neutral-200">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-neutral-200">
          {/* Brand Info */}
          <div className="space-y-4">
            <div
              className="flex items-center gap-2.5 cursor-pointer group"
              onClick={() => navigate("/")}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-tr from-emerald-700 to-amber-500 text-white shadow-lg shadow-emerald-700/20">
                <Hotel size={18} />
              </div>
              <span className="font-bold text-lg tracking-tight text-neutral-900 font-['Space_Grotesk']">
                Luxstay
              </span>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed max-w-sm font-medium">
              Experience world-class hospitality, curated luxury sanctuaries,
              and timeless comfort designed exclusively for your journeys.
            </p>
          </div>

          {/* Quick Navigation Links */}
          <div>
            <h4 className="font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-emerald-700 uppercase tracking-[0.15em] mb-4">
              Exploration
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold text-neutral-500">
              <li>
                <button
                  onClick={() => navigate("/")}
                  className="hover:text-neutral-900 transition cursor-pointer"
                >
                  Browse Properties
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/myBookings")}
                  className="hover:text-neutral-900 transition cursor-pointer"
                >
                  My Reservations
                </button>
              </li>
            </ul>
          </div>

          {/* Trust & Security */}
          <div>
            <h4 className="font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-emerald-700 uppercase tracking-[0.15em] mb-4">
              Assurance
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold text-neutral-500">
              <li className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-700" /> Verified
                Luxury Stays
              </li>
              <li className="flex items-center gap-2">
                <Compass size={14} className="text-emerald-700" /> 24/7 Concierge
                Support
              </li>
            </ul>
          </div>

          {/* Sanctuary Experience Note */}
          <div>
            <h4 className="font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-emerald-700 uppercase tracking-[0.15em] mb-4">
              Sanctuary Experience
            </h4>
            <p className="text-xs text-neutral-500 leading-relaxed font-medium">
              Indulge in refined spaces crafted with warmth, elegance, and
              absolute privacy.
            </p>
          </div>
        </div>

        {/* Bottom Sub-footer */}
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] font-semibold text-neutral-400">
          <p>© {new Date().getFullYear()} Luxstay. All rights reserved.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0 font-['IBM_Plex_Mono',monospace]">
            Crafted with{" "}
            <Heart size={12} className="text-emerald-700 fill-emerald-700" /> for
            supreme comfort
          </p>
        </div>
      </footer>
    </div>
  );
};

export default UserLayout;
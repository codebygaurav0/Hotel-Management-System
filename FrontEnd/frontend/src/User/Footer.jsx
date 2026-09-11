import React from "react";
import { useNavigate } from "react-router-dom";
import { Hotel, MapPin, Phone, Mail, ArrowUp } from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaGithub, // <--- React Icons se GitHub import kar liya hai
} from "react-icons/fa6";

import { FaXTwitter } from "react-icons/fa6";

const Footer = () => {
  const navigate = useNavigate();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="bg-[#fcfaf8] border-t border-[#e8ded1] font-['Inter',sans-serif] pt-16 mt-20 relative text-[#2c1e16]">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-14">
          {/* Brand Identity */}
          <div>
            <div
              onClick={() => navigate("/")}
              className="flex items-center gap-3 cursor-pointer mb-4 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#2c1e16] flex items-center justify-center transition shadow-xs group-hover:bg-[#8c6239]">
                <Hotel className="text-[#e8ded1]" size={18} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#2c1e16] font-['Space_Grotesk'] tracking-tight leading-none">
                  Luxstay
                </h2>
                <p className="text-[10px] text-[#8c6239] tracking-[0.15em] font-bold uppercase font-['IBM_Plex_Mono'] mt-1">
                  Luxury Hotel Booking
                </p>
              </div>
            </div>

            <p className="text-xs text-[#8c786c] leading-relaxed font-medium">
              Discover handpicked luxury hotels, premium stays, and
              unforgettable travel experiences across India. Book your perfect
              stay with confidence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[#2c1e16] text-sm font-bold font-['Space_Grotesk'] mb-4 uppercase tracking-wider font-['IBM_Plex_Mono']">
              Quick Links
            </h3>

            <ul className="space-y-3 text-xs font-semibold text-[#8c786c]">
              <li
                onClick={() => navigate("/")}
                className="hover:text-[#8c6239] transition cursor-pointer flex items-center gap-2"
              >
                Home
              </li>
              <li
                onClick={() => navigate("/myBookings")}
                className="hover:text-[#8c6239] transition cursor-pointer flex items-center gap-2"
              >
                My Bookings
              </li>
              <li
                onClick={() => navigate("/login")}
                className="hover:text-[#8c6239] transition cursor-pointer flex items-center gap-2"
              >
                Partner Sign In
              </li>
              <li
                onClick={() => navigate("/signup")}
                className="hover:text-[#8c6239] transition cursor-pointer flex items-center gap-2"
              >
                List Your Property
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-[#2c1e16] text-sm font-bold font-['Space_Grotesk'] mb-4 uppercase tracking-wider font-['IBM_Plex_Mono']">
              Contact Desk
            </h3>

            <div className="space-y-3 text-xs font-semibold text-[#8c786c]">
              <div className="flex items-start gap-2.5">
                <MapPin className="text-[#8c6239] mt-0.5 shrink-0" size={16} />
                <span>Jaipur, Rajasthan, India</span>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="text-[#8c6239] shrink-0" size={16} />
                <a
                  href="tel:+919602049869"
                  className="hover:text-[#8c6239] transition"
                >
                  +91 9602049869
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="text-[#8c6239] shrink-0" size={16} />
                <a
                  href="mailto:support@luxstay.com"
                  className="hover:text-[#8c6239] transition"
                >
                  support@luxstay.com
                </a>
              </div>
            </div>
          </div>

          {/* Social Media & Actions */}
          <div>
            <h3 className="text-[#2c1e16] text-sm font-bold font-['Space_Grotesk'] mb-4 uppercase tracking-wider font-['IBM_Plex_Mono']">
              Stay Connected
            </h3>

            <p className="text-xs text-[#8c786c] mb-4 font-medium leading-relaxed">
              Follow us on social media for exclusive offers, travel
              inspiration, and the latest luxury updates.
            </p>

            {/* Social Icons */}
            <div className="flex gap-2.5 flex-wrap">
              <a
                href="https://github.com/karan49348"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white border border-[#e8ded1] text-[#2c1e16] hover:bg-[#2c1e16] hover:text-[#e8ded1] hover:border-[#2c1e16] transition-all duration-300 flex items-center justify-center shadow-xs"
                title="GitHub"
              >
                <FaGithub size={15} />
              </a>
              <a
                href="https://www.linkedin.com/in/karan-singh0707/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white border border-[#e8ded1] text-[#2c1e16] hover:bg-[#2c1e16] hover:text-[#e8ded1] hover:border-[#2c1e16] transition-all duration-300 flex items-center justify-center shadow-xs"
                title="LinkedIn"
              >
                <FaLinkedinIn size={14} />
              </a>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white border border-[#e8ded1] text-[#2c1e16] hover:bg-[#2c1e16] hover:text-[#e8ded1] hover:border-[#2c1e16] transition-all duration-300 flex items-center justify-center shadow-xs"
                title="Instagram"
              >
                <FaInstagram size={14} />
              </a>
              <a
                href="https://x.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white border border-[#e8ded1] text-[#2c1e16] hover:bg-[#2c1e16] hover:text-[#e8ded1] hover:border-[#2c1e16] transition-all duration-300 flex items-center justify-center shadow-xs"
                title="X"
              >
                <FaXTwitter size={14} />
              </a>
            </div>

            {/* Back to Top Button */}
            <button
              onClick={scrollToTop}
              className="mt-5 flex items-center gap-2 bg-white border border-[#e8ded1] hover:border-[#2c1e16] text-[#2c1e16] hover:bg-[#2c1e16] hover:text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 shadow-xs cursor-pointer"
            >
              <ArrowUp size={13} />
              Back to Top
            </button>
          </div>
        </div>

        {/* Bottom Copyright Section */}
        <div className="border-t border-[#e8ded1] py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold text-[#8c786c]">
          <p className="text-center md:text-left">
            © {new Date().getFullYear()}{" "}
            <span className="font-bold text-[#2c1e16]">Luxstay</span>. All
            Rights Reserved.
          </p>

          <div className="flex flex-wrap justify-center gap-6">
            <span className="cursor-pointer hover:text-[#8c6239] transition">
              Privacy Policy
            </span>
            <span className="cursor-pointer hover:text-[#8c6239] transition">
              Terms & Conditions
            </span>
            <span className="cursor-pointer hover:text-[#8c6239] transition">
              Refund Policy
            </span>
            <span className="cursor-pointer hover:text-[#8c6239] transition">
              Help Center
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

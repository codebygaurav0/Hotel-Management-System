import React, { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { signupApi } from "../api";

// ⏱️ Custom debounce hook
import useDebounce from "../hooks/useDebounce";

import {
  Search,
  MapPin,
  Star,
  Wifi,
  Waves,
  Sparkles,
  Dumbbell,
  Utensils,
  Car,
  ChevronRight,
  X,
  Menu,
  Hotel,
  Calendar,
  LogOut,
  LayoutDashboard,
  SlidersHorizontal,
  Coffee,
  Shield,
  Check,
  Lock,
  Gamepad2,
  ArrowUpDown,
  ChevronLeft,
} from "lucide-react";

// 🎮 Custom ES Text Icon Component
const EsIcon = ({ size = 14 }) => (
  <span
    className="font-bold tracking-tighter text-[10px] bg-emerald-600/10 px-1 py-0.5 rounded text-emerald-700 border border-emerald-600/20 leading-none"
    style={{ fontSize: `${size - 2}px` }}
  >
    ES
  </span>
);

const amenityIcons = {
  "Free Wi-Fi": <Wifi size={14} />,
  "Free Parking": <Car size={14} />,
  "Valet Parking": <Car size={14} />,
  "24/7 Front Desk": "🛎️",
  "Express Check-in": "⚡",
  "Express Check-out": "⚡",
  "Elevator/Lift": "🛗",
  "Airport Shuttle": "✈️",
  "Railway Station Pickup": "🚆",
  "Taxi Service": "🚕",
  "Car Rental": "🚗",
  "Swimming Pool": <Waves size={14} />,
  "Indoor Pool": <Waves size={14} />,
  "Outdoor Pool": <Waves size={14} />,
  "Kids Pool": "🧒",
  "Gym / Fitness Center": <Dumbbell size={14} />,
  "Spa & Wellness Center": <Sparkles size={14} />,
  "Steam Room": "💨",
  Sauna: "🔥",
  "Yoga Center": "🧘",
  Restaurant: <Utensils size={14} />,
  "Multi-Cuisine Restaurant": "🍽️",
  Cafe: <Coffee size={14} />,
  "Bar / Lounge": "🍷",
  "Rooftop Restaurant": "🏙️",
  "Buffet Breakfast": "🍳",
  "Complimentary Breakfast": "🥐",
  "24/7 Room Service": "🛎️",
  "Laundry Service": "🧺",
  "Dry Cleaning": "👔",
  "Ironing Service": "🥼",
  "Business Center": "💻",
  "Conference Room": "📊",
  "Meeting Room": "💼",
  "Banquet Hall": "🏛️",
  "Wedding Venue": "💍",
  Garden: "🌿",
  Terrace: "🌅",
  "Kids Play Area": "🎠",
  "Game Room": "🎮",
  Library: "📚",
  "BBQ Area": "🔥",
  "Pet Friendly": "🐾",
  "Wheelchair Accessible": "♿",
  "Family Friendly": "👨‍👩‍👧‍👦",
  "Non-Smoking Property": "🚭",
  "Smoking Area": "🚬",
  "Luggage Storage": "🧳",
  "Concierge Service": "🎩",
  "Travel Desk": "🧭",
  "Tour Assistance": "🗺️",
  "Currency Exchange": "💱",
  ATM: "🏧",
  "Gift Shop": "🎁",
  "Beauty Salon": "💄",
  "Medical Assistance": "🩺",
  "Doctor On Call": "👨‍⚕️",
  "First Aid": "🩹",
  "Power Backup": "⚡",
  "CCTV Security": "📷",
  "Fire Safety": "🧯",
  "Smoke Detectors": "🚨",
  "24/7 Security": <Shield size={14} />,
  "EV Charging Station": "🔋",
  "Esports Zone": <Gamepad2 size={14} />,
  "ES Lounge": "🎮",
  "ES Gaming": <EsIcon size={14} />,
};

const RoomImageSlider = ({
  images,
  className = "h-60 rounded-none border-none",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);

  const handleScroll = () => {
    if (scrollRef.current) {
      const index = Math.round(
        scrollRef.current.scrollLeft / scrollRef.current.clientWidth,
      );
      setCurrentIndex(index);
    }
  };

  const scrollToImage = (idx) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: idx * scrollRef.current.clientWidth,
        behavior: "smooth",
      });
      setCurrentIndex(idx);
    }
  };

  return (
    <div
      className={`relative w-full overflow-hidden bg-neutral-100 shadow-inner ${className}`}
    >
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        {images.map((img, idx) => (
          <div
            key={idx}
            className="w-full h-full flex-shrink-0 snap-center relative"
          >
            <img
              src={img}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt={`Slide ${idx + 1}`}
            />
          </div>
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 pointer-events-none"></div>

      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-white/85 backdrop-blur-md px-2.5 py-1 rounded-full z-20 pointer-events-auto border border-neutral-200 shadow-sm">
          {images.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                scrollToImage(idx);
              }}
              aria-label={`Show hotel image ${idx + 1}`}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-all cursor-pointer"
            >
              <span
                aria-hidden="true"
                className={`block rounded-full transition-all ${
                  idx === currentIndex ? "h-1.5 w-4 bg-emerald-700" : "h-1.5 w-1.5 bg-neutral-300"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const PublicHome = () => {
  const navigate = useNavigate();

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters, Search, Sort & Pagination States
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedPropertyType, setSelectedPropertyType] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");

  // Sorting & Pagination States
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalHotelsCount, setTotalHotelsCount] = useState(0);
  const limit = 8;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const hotelAmenitiesList = Object.keys(amenityIcons);

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

  // Fetch Hotels
  const fetchHotels = async () => {
    try {
      setLoading(true);
      setError("");
      const params = {
        ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
        ...(selectedState && { state: selectedState }),
        ...(selectedCity && { city: selectedCity }),
        ...(selectedPropertyType && { propertyType: selectedPropertyType }),
        ...(selectedAmenities.length > 0 && {
          amenities: selectedAmenities.join(","),
        }),
        ...(checkInDate && { checkIn: checkInDate }),
        ...(checkOutDate && { checkOut: checkOutDate }),
        sortBy,
        order,
        page: currentPage,
        limit,
      };

      const res = await axios.get(`${signupApi}hotel/public/all`, { params });
      setHotels(res.data.hotels || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalHotelsCount(res.data.totalHotels || 0);
    } catch (err) {
      console.error("Fetch hotels error:", err);
      setHotels([]);
      setError(err.response?.data?.message || "Unable to load hotels right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, [
    debouncedSearchQuery,
    selectedState,
    selectedCity,
    selectedPropertyType,
    selectedAmenities,
    checkInDate,
    checkOutDate,
    sortBy,
    order,
    currentPage,
  ]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleAmenity = (amenity) => {
    setCurrentPage(1);
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((item) => item !== amenity)
        : [...prev, amenity],
    );
  };

  const token = localStorage.getItem("token");
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    window.location.reload();
  };

  const availablePropertyTypes = useMemo(() => {
    const typesSet = new Set();
    hotels.forEach((h) => {
      if (h.hotelType) typesSet.add(h.hotelType);
    });
    return Array.from(typesSet).sort();
  }, [hotels]);

  const availableStates = useMemo(() => {
    const statesSet = new Set();
    hotels.forEach((h) => {
      const stateName = h.city?.districtId?.stateId?.stateName || h.state;
      if (stateName) statesSet.add(stateName);
    });
    return Array.from(statesSet).sort();
  }, [hotels]);

  const availableCities = useMemo(() => {
    const citiesSet = new Set();
    hotels.forEach((h) => {
      const stateName = h.city?.districtId?.stateId?.stateName || h.state;
      const cityName = h.city?.cityName || h.city;
      if (cityName && (!selectedState || stateName === selectedState)) {
        citiesSet.add(cityName);
      }
    });
    return Array.from(citiesSet).sort();
  }, [hotels, selectedState]);

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-['Inter',sans-serif] flex flex-col justify-between selection:bg-emerald-600 selection:text-white">
      <div>
        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-xl shadow-sm py-4 border-b border-neutral-200">
          <div className="mx-auto flex w-full min-w-0 max-w-[1600px] items-center justify-between px-4 sm:px-8">
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

            <div className="hidden md:flex items-center gap-4">
              {!token ? (
                <>
                  <button
                    onClick={() => navigate("/login")}
                    className="px-4 py-2 rounded-xl font-semibold text-xs uppercase tracking-wider text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate("/signup")}
                    className="bg-gradient-to-r from-emerald-700 to-amber-500 hover:opacity-90 transition text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-700/20 cursor-pointer"
                  >
                    Get Started
                  </button>
                </>
              ) : (
                <div
                  className="relative ml-2 pl-4 border-l border-neutral-200"
                  ref={dropdownRef}
                >
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition border border-neutral-200 hover:bg-neutral-100 text-neutral-700 bg-white cursor-pointer shadow-sm"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-700 to-amber-500 text-white flex items-center justify-center text-xs font-bold">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span className="font-bold text-xs">{user?.name}</span>
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-neutral-200 py-2 z-50">
                      <div className="px-4 py-2.5 border-b border-neutral-200">
                        <p className="text-[10px] text-neutral-400 font-['IBM_Plex_Mono',monospace] uppercase font-bold">
                          Signed in as
                        </p>
                        <p className="text-xs font-bold text-neutral-800 truncate mt-0.5">
                          {user?.email}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          navigate("/myBookings");
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 flex items-center gap-2.5 font-semibold transition cursor-pointer"
                      >
                        <Calendar size={14} className="text-emerald-700" /> My
                        Reservations
                      </button>
                      {(user?.role === "admin" || user?.role === "hotel") && (
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            navigate("/dashboard");
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 flex items-center gap-2.5 font-semibold transition cursor-pointer"
                        >
                          <LayoutDashboard size={14} className="text-emerald-700" />{" "}
                          Management Console
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          navigate("/reset-password");
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 flex items-center gap-2.5 font-semibold transition cursor-pointer"
                      >
                        <Lock size={14} className="text-emerald-700" /> Reset
                        Password
                      </button>
                      <div className="border-t border-neutral-200 my-1"></div>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full text-left bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 mt-1 transition cursor-pointer"
                      >
                        <LogOut size={14} /> Secure Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden shrink-0 p-2 rounded-xl border border-neutral-200 text-neutral-700 bg-white"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {mobileMenuOpen && (
          <>
            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 top-[65px] z-[60] bg-neutral-950/30 md:hidden"
            />
            <aside className="fixed right-0 top-[65px] z-[70] flex h-[calc(100vh-65px)] w-[min(85vw,320px)] flex-col overflow-y-auto border-l border-neutral-200 bg-white p-4 shadow-2xl md:hidden">
              <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/");
                  }}
                  className="rounded-xl px-4 py-3 text-left text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
                >
                  Home
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    document.getElementById("hotel-list")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="rounded-xl px-4 py-3 text-left text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
                >
                  Hotels
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/myBookings");
                  }}
                  className="rounded-xl px-4 py-3 text-left text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
                >
                  My Bookings
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate(token ? "/myBookings" : "/login");
                  }}
                  className="rounded-xl px-4 py-3 text-left text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
                >
                  Profile
                </button>
                <a
                  href="#site-footer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
                >
                  Contact
                </a>
                <div className="my-2 border-t border-neutral-200" />
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    token ? handleLogout() : navigate("/login");
                  }}
                  className="rounded-xl bg-emerald-700 px-4 py-3 text-left text-sm font-bold text-white"
                >
                  {token ? "Logout" : "Login"}
                </button>
              </nav>
            </aside>
          </>
        )}

        {/* Hero Section */}
        <section className="relative pt-36 pb-20 px-6 sm:px-8 bg-gradient-to-b from-neutral-50 via-white to-white text-neutral-900 overflow-hidden border-b border-neutral-200">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none"></div>
          <div className="relative z-10 mx-auto mb-10 w-full min-w-0 max-w-4xl text-center">
            <span className="text-emerald-700 tracking-[0.15em] text-[10px] font-['IBM_Plex_Mono',monospace] font-bold uppercase block mb-2">
              World-Class Destinations
            </span>
            <h1 className="text-3xl md:text-5xl font-bold font-['Space_Grotesk'] tracking-tight text-neutral-900">
              Find Your Sanctuary of Comfort
            </h1>
            <p className="text-neutral-500 mt-2 text-xs md:text-sm font-medium max-w-lg mx-auto">
              Filter by destination, select your travel dates, and explore
              verified luxury properties with Luxstay
            </p>
          </div>

          {/* Search Bar with Debounced Input */}
          <div className="relative z-20 mx-auto w-full min-w-0 max-w-4xl rounded-2xl border border-neutral-200 bg-white p-2.5 text-neutral-900 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
              <div className="px-3.5 py-2 border-b md:border-b-0 md:border-r border-neutral-200">
                <label className="block text-[10px] font-['IBM_Plex_Mono',monospace] text-neutral-400 uppercase font-bold mb-1">
                  Destination / Hotel
                </label>
                <div className="flex items-center gap-2">
                  <Search size={15} className="text-emerald-700 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search city, resort..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full outline-none text-xs font-semibold bg-transparent text-neutral-900 placeholder:text-neutral-400"
                  />
                </div>
              </div>

              <div className="px-3.5 py-2 border-b md:border-b-0 md:border-r border-neutral-200">
                <label className="block text-[10px] font-['IBM_Plex_Mono',monospace] text-neutral-400 uppercase font-bold mb-1">
                  Check-in Date
                </label>
                <div className="flex items-center gap-2">
                  <Calendar size={15} className="text-emerald-700 shrink-0" />
                  <input
                    id="check-in-date"
                    aria-label="Check-in date"
                    type="date"
                    value={checkInDate}
                    onChange={(e) => {
                      setCheckInDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full outline-none text-xs font-semibold bg-transparent text-neutral-900 cursor-pointer"
                  />
                </div>
              </div>

              <div className="px-3.5 py-2 border-b md:border-b-0 border-neutral-200">
                <label className="block text-[10px] font-['IBM_Plex_Mono',monospace] text-neutral-400 uppercase font-bold mb-1">
                  Check-out Date
                </label>
                <div className="flex items-center gap-2">
                  <Calendar size={15} className="text-emerald-700 shrink-0" />
                  <input
                    id="check-out-date"
                    aria-label="Check-out date"
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => {
                      setCheckOutDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    min={checkInDate}
                    className="w-full outline-none text-xs font-semibold bg-transparent text-neutral-900 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <button
                  onClick={() => fetchHotels()}
                  className="w-full bg-gradient-to-r from-emerald-700 to-amber-500 hover:opacity-90 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-emerald-700/20 cursor-pointer"
                >
                  Search Stays
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <div id="hotel-list" className="max-w-[1600px] mx-auto w-full px-4 sm:px-8 py-10 flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-80 w-full shrink-0">
            <div className="sticky top-24 bg-white rounded-3xl shadow-lg border border-neutral-200 p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                <h2 className="text-sm font-bold flex items-center gap-2 font-['Space_Grotesk'] text-neutral-900">
                  <SlidersHorizontal size={15} className="text-emerald-700" />
                  Filters & Amenities
                </h2>

                {(selectedAmenities.length > 0 ||
                  selectedState ||
                  selectedCity ||
                  selectedPropertyType ||
                  checkInDate ||
                  searchQuery) && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedAmenities([]);
                      setSelectedState("");
                      setSelectedCity("");
                      setSelectedPropertyType("");
                      setCheckInDate("");
                      setCheckOutDate("");
                      setCurrentPage(1);
                    }}
                    className="text-xs text-emerald-700 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <X size={12} /> Reset All
                  </button>
                )}
              </div>

              <div className="space-y-3.5 pb-4 border-b border-neutral-200 text-xs">
                <div>
                  <label className="block font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Property Type
                  </label>
                  <select
                    id="property-type-filter"
                    aria-label="Property type"
                    value={selectedPropertyType}
                    onChange={(e) => {
                      setSelectedPropertyType(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-neutral-50 border border-neutral-200 text-xs font-semibold rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-600 text-neutral-700 capitalize cursor-pointer shadow-inner"
                  >
                    <option value="">All Property Types</option>
                    {availablePropertyTypes.map((pt) => (
                      <option key={pt} value={pt} className="capitalize">
                        {pt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Filter by State
                  </label>
                  <select
                    id="state-filter"
                    aria-label="State"
                    value={selectedState}
                    onChange={(e) => {
                      setSelectedState(e.target.value);
                      setSelectedCity("");
                      setCurrentPage(1);
                    }}
                    className="w-full bg-neutral-50 border border-neutral-200 text-xs font-semibold rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-600 text-neutral-700 capitalize cursor-pointer shadow-inner"
                  >
                    <option value="">All States</option>
                    {availableStates.map((st) => (
                      <option key={st} value={st} className="capitalize">
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Filter by City
                  </label>
                  <select
                    id="city-filter"
                    aria-label="City"
                    value={selectedCity}
                    onChange={(e) => {
                      setSelectedCity(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-neutral-50 border border-neutral-200 text-xs font-semibold rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-600 text-neutral-700 capitalize cursor-pointer shadow-inner"
                  >
                    <option value="">All Cities</option>
                    {availableCities.map((ct) => (
                      <option key={ct} value={ct} className="capitalize">
                        {ct}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Amenities Checklist */}
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <h3 className="font-['IBM_Plex_Mono',monospace] text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Amenities ({hotelAmenitiesList.length})
                  </h3>
                  {selectedAmenities.length > 0 && (
                    <span className="text-[10px] bg-emerald-600/10 text-emerald-700 font-bold px-2 py-0.5 rounded-md border border-emerald-600/30">
                      {selectedAmenities.length} selected
                    </span>
                  )}
                </div>

                <div className="space-y-1 max-h-[350px] overflow-y-auto pr-1">
                  {hotelAmenitiesList.map((item) => {
                    const isChecked = selectedAmenities.includes(item);
                    return (
                      <label
                        key={item}
                        className={`flex items-center justify-between rounded-xl cursor-pointer px-3 py-2 transition-all duration-150 border text-xs font-medium ${
                          isChecked
                            ? "bg-emerald-700 text-white border-emerald-700 shadow-lg shadow-emerald-700/20 font-bold"
                            : "border-neutral-200 hover:bg-neutral-50 text-neutral-600 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="w-4 flex justify-center text-xs shrink-0">
                            {amenityIcons[item] || "✓"}
                          </span>
                          <span className="truncate">{item}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleAmenity(item)}
                          className="hidden"
                        />
                        {isChecked && (
                          <div className="w-2 h-2 rounded-full bg-white shrink-0"></div>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Hotel Listings & Sorting Controls */}
          <section className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 bg-white px-6 py-4 rounded-2xl border border-neutral-200 shadow-lg">
              <div>
                <span className="text-[10px] font-['IBM_Plex_Mono',monospace] tracking-[0.15em] text-emerald-700 font-bold uppercase block mb-0.5">
                  Verified Properties
                </span>
                <h2 className="text-lg font-bold font-['Space_Grotesk'] text-neutral-900">
                  Available Stays ({totalHotelsCount})
                </h2>
              </div>

              {/* Sorting Controls */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-1.5 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-1.5 shadow-inner w-full sm:w-auto">
                  <ArrowUpDown size={14} className="text-emerald-700" />
                  <span className="text-[10px] font-bold uppercase text-neutral-500 font-['IBM_Plex_Mono']">
                    Sort By:
                  </span>
                  <select
                    aria-label="Sort hotels by"
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-transparent text-xs font-bold text-neutral-700 outline-none cursor-pointer"
                  >
                    <option value="createdAt" className="bg-white">
                      Newest Added
                    </option>
                    <option value="pricePerNight" className="bg-white">
                      Price
                    </option>
                    <option value="hotelName" className="bg-white">
                      Hotel Name
                    </option>
                  </select>
                  <select
                    aria-label="Sort direction"
                    value={order}
                    onChange={(e) => {
                      setOrder(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-transparent text-xs font-bold text-neutral-700 outline-none cursor-pointer border-l border-neutral-200 pl-2"
                  >
                    <option value="asc" className="bg-white">
                      {sortBy === "pricePerNight" ? "Low to High" : "Ascending"}
                    </option>
                    <option value="desc" className="bg-white">
                      {sortBy === "pricePerNight"
                        ? "High to Low"
                        : "Descending"}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="h-64 flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-neutral-200 shadow-sm">
                <div className="w-8 h-8 border-4 border-emerald-700 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-neutral-400 font-['IBM_Plex_Mono',monospace] text-[11px] uppercase font-semibold">
                  Updating stays...
                </p>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
                <h2 className="text-lg font-bold text-rose-900">We could not load hotels</h2>
                <p className="mt-2 text-sm text-rose-700">{error}</p>
                <button
                  type="button"
                  onClick={fetchHotels}
                  className="mt-4 rounded-xl bg-rose-700 px-4 py-2.5 text-sm font-bold text-white"
                >
                  Try again
                </button>
              </div>
            ) : (
              <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2">
                {hotels.length > 0 ? (
                  hotels.map((hotel) => {
                    const hotelAmenities = Array.isArray(hotel.amenities)
                      ? hotel.amenities
                      : hotel.amenities
                        ? hotel.amenities.split(",").map((item) => item.trim())
                        : [];

                    return (
                      <div
                        key={hotel._id}
                        onClick={() => navigate(`/hotel-details/${hotel._id}`)}
                        className="group min-w-0 w-full max-w-full cursor-pointer overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-lg transition-all duration-300 hover:border-neutral-300 hover:shadow-xl"
                      >
                        <div className="relative h-56 overflow-hidden bg-neutral-100">
                          <RoomImageSlider
                            images={
                              hotel.hotelImages?.length > 0
                                ? hotel.hotelImages
                                : [
                                    "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070",
                                  ]
                            }
                            className="w-full h-full rounded-none border-none"
                          />

                          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md rounded-xl px-2.5 py-1 flex items-center gap-1 shadow-lg z-20 pointer-events-none border border-neutral-200">
                            <Star
                              size={12}
                              fill="#047857"
                              className="text-emerald-700"
                            />
                            <span className="text-[11px] font-bold text-neutral-900">
                              4.9
                            </span>
                          </div>

                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-emerald-700 text-[9px] font-bold px-2.5 py-1 rounded-xl tracking-wider uppercase border border-emerald-600/30 z-20 pointer-events-none font-['IBM_Plex_Mono'] shadow-lg">
                            Verified
                          </div>

                          <div className="absolute bottom-4 left-4 right-4 text-white z-20 pointer-events-none">
                            <h3 className="text-lg font-bold font-['Space_Grotesk'] leading-tight drop-shadow-md">
                              {hotel.hotelName}
                            </h3>
                            <p className="flex items-center gap-1 text-[11px] mt-1 text-neutral-100 font-medium capitalize truncate">
                              <MapPin
                                size={12}
                                className="text-amber-400 shrink-0"
                              />
                              {hotel.city?.cityName || hotel.city},{" "}
                              {hotel.city?.districtId?.stateId?.stateName ||
                                hotel.state}
                            </p>
                          </div>
                        </div>

                        <div className="p-5 flex flex-col justify-between flex-1">
                          <div className="flex flex-wrap gap-1.5 min-h-[32px] mb-4">
                            {hotelAmenities.length > 0 ? (
                              hotelAmenities.slice(0, 4).map((item) => (
                                <div
                                  key={item}
                                  className="flex items-center gap-1 bg-neutral-50 text-neutral-600 border border-neutral-200 px-2.5 py-1 rounded-lg text-[10px] font-medium shadow-inner"
                                >
                                  {amenityIcons[item] || (
                                    <Check
                                      size={11}
                                      className="text-emerald-700"
                                    />
                                  )}
                                  <span>{item}</span>
                                </div>
                              ))
                            ) : (
                              <span className="text-[11px] text-neutral-400 italic">
                                No amenities specified
                              </span>
                            )}
                            {hotelAmenities.length > 4 && (
                              <span className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-lg font-bold flex items-center border border-neutral-200">
                                +{hotelAmenities.length - 4} more
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-3.5 border-t border-neutral-200">
                            <div>
                              <span className="text-[10px] font-['IBM_Plex_Mono',monospace] text-neutral-400 uppercase tracking-wider block">
                                Starting from
                              </span>
                              <span className="font-bold text-neutral-900 text-base font-['Space_Grotesk']">
                                ₹{hotel.pricePerNight || "2,500"}{" "}
                                <span className="text-xs text-neutral-400 font-sans font-normal">
                                  / night
                                </span>
                              </span>
                            </div>

                            <button className="rounded-xl bg-gradient-to-r from-emerald-700 to-amber-500 hover:opacity-90 text-white px-4 py-2 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 transition shadow-lg shadow-emerald-700/20 cursor-pointer">
                              View Details <ChevronRight size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-neutral-300 text-center px-6 shadow-sm">
                    <Search
                      size={40}
                      className="text-neutral-300 mb-3 stroke-1"
                    />
                    <h2 className="text-lg font-bold font-['Space_Grotesk'] text-neutral-900">
                      No Properties Found
                    </h2>
                    <p className="text-neutral-500 mt-1 text-xs max-w-sm font-medium">
                      We couldn't find any properties matching your current
                      filter selections or selected dates. Try resetting your
                      criteria.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedAmenities([]);
                        setSelectedState("");
                        setSelectedCity("");
                        setSelectedPropertyType("");
                        setCheckInDate("");
                        setCheckOutDate("");
                        setCurrentPage(1);
                      }}
                      className="mt-5 bg-gradient-to-r from-emerald-700 to-amber-500 hover:opacity-90 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-lg shadow-emerald-700/20"
                    >
                      Reset All Filters
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8 py-4 bg-white rounded-2xl border border-neutral-200 shadow-sm">
                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  className="px-4 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-bold text-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-100 transition flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                <span className="text-xs font-bold font-['IBM_Plex_Mono'] text-neutral-500 px-3">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className="px-4 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-bold text-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-100 transition flex items-center gap-1 cursor-pointer"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default PublicHome;
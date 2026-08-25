// src/components/AddHotels.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { signupApi } from "../api";
import {
  UploadCloud,
  Loader2,
  ArrowLeft,
  Hotel,
  CheckSquare,
  CheckCircle2,
  X,
  Building2,
  MapPin,
  Mail,
  FileText,
  Image as ImageIcon,
  BedDouble,
  ChevronRight,
  Plus,
  Sparkles,
  Layers,
  Save,
} from "lucide-react";

const AddHotels = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const token = localStorage.getItem("token");

  const currentUser = JSON.parse(
    localStorage.getItem("currentUser") || localStorage.getItem("user") || "{}",
  );
  const isSuperAdmin = currentUser?.role === "superAdmin";

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("general");

  // Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const [form, setForm] = useState({
    hotelName: "",
    hotelEmail: "",
    city: "",
    adminId: "",
    address: "",
    hotelType: "Hotel",
    totalRooms: "",
    description: "",
    amenities: [],
    hotelImages: [],
  });

  const amenitiesList = [
    "Free Wi-Fi",
    "Free Parking",
    "Valet Parking",
    "24/7 Front Desk",
    "Express Check-in",
    "Express Check-out",
    "Elevator/Lift",
    "Airport Shuttle",
    "Railway Station Pickup",
    "Taxi Service",
    "Car Rental",
    "Swimming Pool",
    "Indoor Pool",
    "Outdoor Pool",
    "Kids Pool",
    "Gym / Fitness Center",
    "Spa & Wellness Center",
    "Steam Room",
    "Sauna",
    "Yoga Center",
    "Restaurant",
    "Multi-Cuisine Restaurant",
    "Cafe",
    "Bar / Lounge",
    "Rooftop Restaurant",
    "Buffet Breakfast",
    "Complimentary Breakfast",
    "24/7 Room Service",
    "Laundry Service",
    "Dry Cleaning",
    "Ironing Service",
    "Business Center",
    "Conference Room",
    "Meeting Room",
    "Banquet Hall",
    "Wedding Venue",
    "Garden",
    "Terrace",
    "Kids Play Area",
    "Game Room",
    "Library",
    "BBQ Area",
    "Pet Friendly",
    "Wheelchair Accessible",
    "Family Friendly",
    "Non-Smoking Property",
    "Smoking Area",
    "Luggage Storage",
    "Concierge Service",
    "Travel Desk",
    "Tour Assistance",
    "Currency Exchange",
    "ATM",
    "Gift Shop",
    "Beauty Salon",
    "Medical Assistance",
    "Doctor On Call",
    "First Aid",
    "Power Backup",
    "CCTV Security",
    "Fire Safety",
    "Smoke Detectors",
    "24/7 Security",
    "EV Charging Station",
  ];

  const getApprovedAdmins = async () => {
    try {
      const response = await axios.get(`${signupApi}admin/approved`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins(response.data.admins || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getCities();
    if (isSuperAdmin) getApprovedAdmins();
    if (id) getHotelById();
  }, [id]);

  const getCities = async () => {
    try {
      const response = await axios.get(`${signupApi}city/active`);
      setCities(response.data.result || []);
    } catch (error) {
      console.error("Cities fetching error:", error);
    }
  };

  const getHotelById = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${signupApi}hotel/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const hotel = response.data.hotel;

      setForm({
        hotelName: hotel.hotelName || "",
        hotelEmail: hotel.hotelEmail || "",
        city: hotel.city?._id || hotel.city || "",
        adminId: hotel.adminId?._id || hotel.adminId || "",
        address: hotel.address || "",
        hotelType: hotel.hotelType || "Hotel",
        totalRooms: hotel.totalRooms || "",
        description: hotel.description || "",
        amenities: hotel.amenities || [],
        hotelImages: [],
      });

      if (hotel.hotelImages) {
        setPreviewImages(hotel.hotelImages);
      }
    } catch (error) {
      console.error("Fetch hotel error:", error);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    let newErrors = {};

    if (!form.hotelName.trim()) newErrors.hotelName = "Hotel Name is required";
    else if (form.hotelName.trim().length < 3)
      newErrors.hotelName = "Minimum 3 characters required";

    if (!form.hotelEmail.trim())
      newErrors.hotelEmail = "Hotel Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.hotelEmail))
      newErrors.hotelEmail = "Invalid Email format";

    if (!form.city) newErrors.city = "City selection is required";
    if (isSuperAdmin && !form.adminId)
      newErrors.adminId = "Admin assignment is required";

    if (!form.address.trim()) newErrors.address = "Address is required";
    else if (form.address.trim().length < 10)
      newErrors.address = "Provide a detailed address (min 10 chars)";

    if (!form.totalRooms) newErrors.totalRooms = "Total Rooms is required";
    else if (Number(form.totalRooms) <= 0)
      newErrors.totalRooms = "Must be a valid positive number";

    if (!form.description.trim())
      newErrors.description = "Description is required";
    else if (form.description.trim().length < 20)
      newErrors.description = "Provide a meaningful description (min 20 chars)";

    if (form.amenities.length === 0)
      newErrors.amenities = "Select at least one amenity";

    if (!id && form.hotelImages.length < 3)
      newErrors.hotelImages = "Upload at least 3 property images";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleAmenities = (item) => {
    setForm((prev) => {
      const exists = prev.amenities.includes(item);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== item)
          : [...prev.amenities, item],
      };
    });
    setErrors((prev) => ({ ...prev, amenities: "" }));
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);

    if (!id && files.length < 3) {
      setErrors((prev) => ({
        ...prev,
        hotelImages: "Upload at least 3 property images",
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, hotelImages: "" }));
    setForm((prev) => ({ ...prev, hotelImages: files }));

    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const formData = new FormData();

      formData.append("hotelName", form.hotelName);
      formData.append("hotelEmail", form.hotelEmail);
      formData.append("city", form.city);
      if (isSuperAdmin) formData.append("adminId", form.adminId);
      formData.append("address", form.address);
      formData.append("hotelType", form.hotelType);
      formData.append("totalRooms", form.totalRooms);
      formData.append("description", form.description);

      form.amenities.forEach((item) => formData.append("amenities", item));
      form.hotelImages.forEach((image) =>
        formData.append("hotelImages", image),
      );

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      };
      let response;

      if (id) {
        response = await axios.patch(
          `${signupApi}hotel/update/${id}`,
          formData,
          {
            headers,
          },
        );
        setModalMessage(
          response.data.message || "Property updated successfully.",
        );
      } else {
        response = await axios.post(`${signupApi}hotel/create`, formData, {
          headers,
        });
        setModalMessage(
          response.data.message || "Property registered successfully.",
        );
      }

      setShowSuccessModal(true);
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate(isSuperAdmin ? "/superAdmin/dashboard" : "/admin/dashboard");
  };

  if (loading && id && !form.hotelName) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[500px] gap-4 bg-white/60 backdrop-blur-md rounded-2xl border border-neutral-200">
        <div className="relative flex items-center justify-center">
          <Loader2 className="animate-spin text-emerald-700" size={42} />
          <Hotel className="absolute text-emerald-800 opacity-60" size={18} />
        </div>
        <h2 className="text-neutral-500 font-mono text-xs uppercase tracking-widest font-semibold">
          Loading Property Details...
        </h2>
      </div>
    );
  }

  const sections = [
    { id: "general", label: "Basic Details", icon: Building2 },
    { id: "amenities", label: "Facilities & Amenities", icon: CheckSquare },
    { id: "description", label: "Property Narrative", icon: FileText },
    { id: "media", label: "Gallery Photos", icon: ImageIcon },
  ];

  return (
    <div className="max-w-[1240px] mx-auto text-neutral-800 font-sans pb-16 px-4 sm:px-6">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-30 bg-neutral-50/90 backdrop-blur-md py-4 mb-8 border-b border-neutral-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 mb-1 transition-colors group cursor-pointer"
            >
              <ArrowLeft
                size={14}
                className="group-hover:-translate-x-1 transition-transform"
              />
              Back to Overview
            </button>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-emerald-600/10 text-emerald-700 border border-emerald-600/20">
                <Hotel size={22} />
              </span>
              {id ? "Edit Property Listing" : "Register New Property"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-700 shadow-xs transition-all cursor-pointer"
            >
              Discard
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-700 to-amber-500 hover:opacity-90 text-white shadow-md hover:shadow-lg flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
            >
              {loading ? (
                <Loader2 size={15} className="animate-spin text-white" />
              ) : (
                <Save size={15} className="text-white" />
              )}
              {id ? "Update Listing" : "Publish Property"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Navigation Steps + Right Content Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Navigation Sidebar */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-3.5 shadow-sm sticky top-24 space-y-1">
            <div className="px-3 py-2 flex items-center justify-between border-b border-neutral-100 mb-2">
              <span className="font-mono text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                Form Sections
              </span>
              <Layers size={14} className="text-neutral-400" />
            </div>

            {sections.map((sec, idx) => {
              const Icon = sec.icon;
              const isActive = activeTab === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(sec.id);
                    document
                      .getElementById(sec.id)
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "text-neutral-600 hover:bg-neutral-100/80 hover:text-neutral-900"
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon
                      size={17}
                      className={isActive ? "text-amber-300" : "text-neutral-400"}
                    />
                    <span className="truncate">{sec.label}</span>
                  </div>
                  <ChevronRight
                    size={14}
                    className={`transition-transform ${
                      isActive
                        ? "text-amber-300 translate-x-0.5"
                        : "text-neutral-300"
                    }`}
                  />
                </button>
              );
            })}

            {/* Completion Helper Widget */}
            <div className="mt-4 pt-3 border-t border-neutral-100 px-3">
              <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-1.5 font-medium">
                <span>Selected Amenities</span>
                <span className="font-bold text-neutral-900">
                  {form.amenities.length}
                </span>
              </div>
              <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full transition-all duration-300"
                  style={{
                    width: `${Math.min((form.amenities.length / 10) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Cards Container */}
        <div className="lg:col-span-9 space-y-8">
          {/* Card 1: Basic Information */}
          <section
            id="general"
            className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-xs hover:shadow-sm transition-shadow space-y-6"
          >
            <div className="border-b border-neutral-100 pb-4 flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                  Step 01
                </span>
                <h3 className="text-lg font-bold text-neutral-900 mt-0.5">
                  Property Basic Details
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
                <Building2 size={20} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              {/* Hotel Name */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                  Hotel Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="hotelName"
                    value={form.hotelName}
                    onChange={handleChange}
                    placeholder="e.g. Royal Heritage Resort"
                    className="w-full bg-neutral-50/50 border border-neutral-200 text-xs rounded-xl pl-9 pr-4 h-11 outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/10 transition-all font-medium"
                  />
                  <Hotel
                    size={16}
                    className="absolute left-3 top-3.5 text-neutral-400"
                  />
                </div>
                {errors.hotelName && (
                  <p className="text-rose-600 text-[11px] font-semibold mt-1.5 flex items-center gap-1">
                    ✕ {errors.hotelName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                  Contact Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="hotelEmail"
                    value={form.hotelEmail}
                    onChange={handleChange}
                    placeholder="contact@hotel.com"
                    className="w-full bg-neutral-50/50 border border-neutral-200 text-xs rounded-xl pl-9 pr-4 h-11 outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/10 transition-all font-medium"
                  />
                  <Mail
                    size={16}
                    className="absolute left-3 top-3.5 text-neutral-400"
                  />
                </div>
                {errors.hotelEmail && (
                  <p className="text-rose-600 text-[11px] font-semibold mt-1.5 flex items-center gap-1">
                    ✕ {errors.hotelEmail}
                  </p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                  City / Location <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className="w-full bg-neutral-50/50 border border-neutral-200 text-xs rounded-xl pl-9 pr-4 h-11 outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/10 transition-all font-medium appearance-none cursor-pointer"
                  >
                    <option value="">Select City Location</option>
                    {cities.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.cityName}
                      </option>
                    ))}
                  </select>
                  <MapPin
                    size={16}
                    className="absolute left-3 top-3.5 text-neutral-400 pointer-events-none"
                  />
                </div>
                {errors.city && (
                  <p className="text-rose-600 text-[11px] font-semibold mt-1.5 flex items-center gap-1">
                    ✕ {errors.city}
                  </p>
                )}
              </div>

              {/* Assign Admin (SuperAdmin Only) */}
              {isSuperAdmin && (
                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                    Assigned Admin Manager{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="adminId"
                    value={form.adminId}
                    onChange={handleChange}
                    className="w-full bg-neutral-50/50 border border-neutral-200 text-xs rounded-xl px-3.5 h-11 outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/10 transition-all font-medium cursor-pointer"
                  >
                    <option value="">Select Admin Account</option>
                    {admins.map((adm) => (
                      <option key={adm._id} value={adm._id}>
                        {adm.name} ({adm.email})
                      </option>
                    ))}
                  </select>
                  {errors.adminId && (
                    <p className="text-rose-600 text-[11px] font-semibold mt-1.5 flex items-center gap-1">
                      ✕ {errors.adminId}
                    </p>
                  )}
                </div>
              )}

              {/* Establishment Type */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                  Property Class / Category
                </label>
                <select
                  name="hotelType"
                  value={form.hotelType}
                  onChange={handleChange}
                  className="w-full bg-neutral-50/50 border border-neutral-200 text-xs rounded-xl px-3.5 h-11 outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/10 transition-all font-medium cursor-pointer"
                >
                  <option value="Hotel">Hotel</option>
                  <option value="Resort">Resort</option>
                  <option value="Villa">Villa</option>
                  <option value="Guest House">Guest House</option>
                  <option value="Hostel">Hostel</option>
                </select>
              </div>

              {/* Total Rooms */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                  Total Room Inventory <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="totalRooms"
                    value={form.totalRooms}
                    onChange={handleChange}
                    placeholder="e.g. 40"
                    className="w-full bg-neutral-50/50 border border-neutral-200 text-xs rounded-xl pl-9 pr-4 h-11 outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/10 transition-all font-medium"
                  />
                  <BedDouble
                    size={16}
                    className="absolute left-3 top-3.5 text-neutral-400"
                  />
                </div>
                {errors.totalRooms && (
                  <p className="text-rose-600 text-[11px] font-semibold mt-1.5 flex items-center gap-1">
                    ✕ {errors.totalRooms}
                  </p>
                )}
              </div>

              {/* Full Address */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                  Complete Property Address{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows="2"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Street address, zip code, landmark info..."
                  className="w-full bg-neutral-50/50 border border-neutral-200 text-xs rounded-xl p-3.5 outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/10 transition-all font-medium resize-none leading-relaxed"
                />
                {errors.address && (
                  <p className="text-rose-600 text-[11px] font-semibold mt-1.5 flex items-center gap-1">
                    ✕ {errors.address}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Card 2: Amenities Selection Grid */}
          <section
            id="amenities"
            className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-xs hover:shadow-sm transition-shadow space-y-5"
          >
            <div className="border-b border-neutral-100 pb-4 flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                  Step 02
                </span>
                <h3 className="text-lg font-bold text-neutral-900 mt-0.5">
                  Facilities & Amenities
                </h3>
              </div>
              <span className="text-xs font-bold text-neutral-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full">
                {form.amenities.length} Selected
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-200">
              {amenitiesList.map((item) => {
                const selected = form.amenities.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleAmenities(item)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                      selected
                        ? "bg-emerald-700 text-white border-emerald-700 shadow-xs font-semibold"
                        : "bg-neutral-50/50 text-neutral-700 border-neutral-200/80 hover:bg-neutral-100/70"
                    }`}
                  >
                    <span className="truncate pr-1">{item}</span>
                    {selected ? (
                      <CheckCircle2
                        size={14}
                        className="text-amber-300 shrink-0"
                      />
                    ) : (
                      <Plus size={13} className="text-neutral-300 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
            {errors.amenities && (
              <p className="text-rose-600 text-[11px] font-semibold mt-1 flex items-center gap-1">
                ✕ {errors.amenities}
              </p>
            )}
          </section>

          {/* Card 3: Description */}
          <section
            id="description"
            className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-xs hover:shadow-sm transition-shadow space-y-5"
          >
            <div className="border-b border-neutral-100 pb-4 flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                  Step 03
                </span>
                <h3 className="text-lg font-bold text-neutral-900 mt-0.5">
                  Property Narrative & Overview
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
                <FileText size={20} />
              </div>
            </div>

            <div>
              <textarea
                rows="4"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Detail the experience, surroundings, special services, views, and room features..."
                className="w-full bg-neutral-50/50 border border-neutral-200 text-xs rounded-xl p-4 outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/10 transition-all font-medium leading-relaxed resize-none"
              />
              {errors.description && (
                <p className="text-rose-600 text-[11px] font-semibold mt-1 flex items-center gap-1">
                  ✕ {errors.description}
                </p>
              )}
            </div>
          </section>

          {/* Card 4: Media Upload */}
          <section
            id="media"
            className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-xs hover:shadow-sm transition-shadow space-y-5"
          >
            <div className="border-b border-neutral-100 pb-4 flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                  Step 04
                </span>
                <h3 className="text-lg font-bold text-neutral-900 mt-0.5">
                  High-Res Gallery Photos
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
                <ImageIcon size={20} />
              </div>
            </div>

            <div className="border-2 border-dashed border-neutral-300 rounded-2xl p-8 bg-neutral-50/40 text-center hover:bg-neutral-50 hover:border-emerald-600 transition-all relative cursor-pointer group">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImages}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-12 h-12 rounded-xl bg-emerald-600/10 text-emerald-700 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <UploadCloud size={24} />
              </div>
              <p className="text-xs font-bold text-neutral-800">
                Click or drag images here to upload
              </p>
              <p className="text-[11px] text-neutral-500 mt-1">
                Upload minimum 3 high-resolution photos (.jpg, .png, .webp)
              </p>
            </div>
            {errors.hotelImages && (
              <p className="text-rose-600 text-[11px] font-semibold mt-1 flex items-center gap-1">
                ✕ {errors.hotelImages}
              </p>
            )}

            {/* Preview Grid */}
            {previewImages.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-2">
                {previewImages.map((src, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 relative group shadow-xs"
                  >
                    <img
                      src={src}
                      alt={`preview-${i}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-neutral-900/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Bottom Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200/80">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 text-xs font-semibold rounded-xl border border-neutral-300 bg-white hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-700 to-amber-500 hover:opacity-90 text-white shadow-md flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
            >
              {loading && (
                <Loader2 size={15} className="animate-spin text-white" />
              )}
              {id ? "Save & Update Profile" : "Register Property Profile"}
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-neutral-200 rounded-2xl p-7 w-full max-w-[400px] shadow-2xl text-center relative animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={30} />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-1">
              Operation Successful
            </h3>
            <p className="text-xs text-neutral-500 mb-6 leading-relaxed">
              {modalMessage}
            </p>
            <button
              onClick={handleCloseModal}
              className="w-full py-3 bg-gradient-to-r from-emerald-700 to-amber-500 text-white text-xs font-bold rounded-xl hover:opacity-90 transition shadow-md active:scale-[0.98] cursor-pointer"
            >
              Return to Console Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddHotels;
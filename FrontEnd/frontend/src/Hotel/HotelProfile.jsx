
import React, { useEffect, useState } from "react";
import axios from "axios";
import { signupApi } from "../api";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Edit3,
  Save,
  Info,
  Loader2,
  X,
} from "lucide-react";
import { Toaster, toast } from "sonner";

const HotelProfile = () => {
  const token = localStorage.getItem("token");

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    hotelId: "",
    hotelName: "",
    hotelEmail: "",
    phone: "",
    address: "",
    city: "",
    cityName: "",
    state: "",
    zipCode: "",
    description: "",
    status: "Pending",
  });

  useEffect(() => {
    fetchHotelProfile();
  }, []);

  // ==========================================
  // GET LOGGED-IN HOTEL PROFILE
  // ==========================================
  const fetchHotelProfile = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${signupApi}hotel/particular-dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.success) {
        const data = response.data.hotel;

        const cityObj = data.city || {};

        const cityName = cityObj.cityName || "";

        const stateName =
          cityObj.districtId?.stateId?.stateName || "";

        const cityId = cityObj._id || "";

        setProfileData({
          // IMPORTANT: hotel _id save karna
          hotelId: data._id || "",

          hotelName: data.hotelName || "",
          hotelEmail: data.hotelEmail || "",
          phone: data.phone || "",
          address: data.address || "",

          city: cityId,
          cityName: cityName,
          state: stateName,

          zipCode: data.zipCode || "",
          description: data.description || "",
          status: data.status || "Pending",
        });
      }
    } catch (error) {
      console.error("Profile Fetch Error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load profile data."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INPUT CHANGE
  // ==========================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // UPDATE HOTEL PROFILE
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!profileData.hotelId) {
      toast.error("Hotel ID not found. Please refresh the page.");
      return;
    }

    try {
      setSaving(true);

      // Backend route:
      // PATCH /hotel/update/:id
      const response = await axios.patch(
        `${signupApi}hotel/update/${profileData.hotelId}`,
        {
          hotelName: profileData.hotelName,
          hotelEmail: profileData.hotelEmail,
          city: profileData.city,
          address: profileData.address,
          description: profileData.description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.success) {
        toast.success("Hotel profile updated successfully!");

        setIsEditing(false);

        // Updated data dobara database se fetch karo
        await fetchHotelProfile();
      }
    } catch (error) {
      console.error("Profile Update Error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px] gap-3 bg-slate-50/50 rounded-2xl border border-slate-200">
        <Loader2
          className="animate-spin text-emerald-600"
          size={32}
        />

        <p className="font-mono text-[11px] text-slate-400 uppercase tracking-widest font-semibold">
          Retrieving Profile Details...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-slate-800 font-sans max-w-[1200px] mx-auto pb-12">
      <Toaster position="top-right" richColors />

      {/* ================================
          HEADER
      ================================= */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">

        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none"></div>

        <div className="flex items-center gap-5 z-10">

          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-emerald-400 shadow-md shrink-0">
            <Building2 size={32} strokeWidth={1.75} />
          </div>

          <div>
            <div className="flex items-center gap-3 mb-1.5 flex-wrap">

              <h1 className="font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight m-0">
                {profileData.hotelName || "Your Hotel Name"}
              </h1>

              <span
                className={`px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg border shadow-2xs ${
                  profileData.status === "Approved"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : profileData.status === "Rejected"
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {profileData.status}
              </span>
            </div>

            <p className="text-slate-500 text-xs font-semibold m-0 flex items-center gap-1.5 capitalize">
              <MapPin
                size={14}
                className="text-emerald-600"
              />

              {profileData.cityName
                ? `${profileData.cityName}, ${profileData.state}`
                : "Location not specified"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className={`z-10 h-11 px-6 rounded-2xl text-xs font-bold uppercase tracking-wider transition duration-200 shadow-xs flex items-center gap-2 cursor-pointer ${
            isEditing
              ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
              : "bg-emerald-600 hover:bg-emerald-700 text-white"
          }`}
        >
          {isEditing ? (
            <>
              <X size={15} />
              Cancel Edit
            </>
          ) : (
            <>
              <Edit3 size={15} />
              Edit Profile
            </>
          )}
        </button>
      </div>

      {/* ================================
          FORM
      ================================= */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden"
      >

        <div className="p-6 sm:px-8 border-b border-slate-100 bg-slate-50/50">

          <span className="font-mono text-[10px] tracking-[0.15em] text-emerald-600 font-bold uppercase block mb-1">
            PROPERTY IDENTITY
          </span>

          <h2 className="font-extrabold text-lg text-slate-900 m-0">
            Primary Details & Contact Info
          </h2>
        </div>

        <div className="p-6 sm:p-8 space-y-6 text-xs">

          {/* BASIC INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>
              <label className="block text-slate-700 text-xs font-bold mb-2 flex items-center gap-1.5">
                <Building2
                  size={14}
                  className="text-emerald-600"
                />
                Hotel Name
              </label>

              <input
                type="text"
                name="hotelName"
                value={profileData.hotelName}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full border px-4 h-11 rounded-xl outline-none font-medium transition duration-200 ${
                  isEditing
                    ? "bg-white border-emerald-500 text-slate-900 focus:ring-2 focus:ring-emerald-500/20"
                    : "bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed"
                }`}
              />
            </div>

            <div>
              <label className="block text-slate-700 text-xs font-bold mb-2 flex items-center gap-1.5">
                <Mail
                  size={14}
                  className="text-emerald-600"
                />
                Registered Email
              </label>

              <input
                type="email"
                name="hotelEmail"
                value={profileData.hotelEmail}
                disabled={true}
                className="w-full bg-slate-50 border border-slate-200 px-4 h-11 rounded-xl outline-none text-slate-500 font-medium cursor-not-allowed"
                title="Email address cannot be modified"
              />
            </div>
          </div>

          {/* CONTACT & ADDRESS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>
              <label className="block text-slate-700 text-xs font-bold mb-2 flex items-center gap-1.5">
                <Phone
                  size={14}
                  className="text-emerald-600"
                />
                Phone Number
              </label>

              <input
                type="text"
                name="phone"
                value={profileData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full border px-4 h-11 rounded-xl outline-none font-medium transition duration-200 ${
                  isEditing
                    ? "bg-white border-emerald-500 text-slate-900 focus:ring-2 focus:ring-emerald-500/20"
                    : "bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed"
                }`}
              />
            </div>

            <div>
              <label className="block text-slate-700 text-xs font-bold mb-2 flex items-center gap-1.5">
                <MapPin
                  size={14}
                  className="text-emerald-600"
                />
                Street Address
              </label>

              <input
                type="text"
                name="address"
                value={profileData.address}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full border px-4 h-11 rounded-xl outline-none font-medium transition duration-200 ${
                  isEditing
                    ? "bg-white border-emerald-500 text-slate-900 focus:ring-2 focus:ring-emerald-500/20"
                    : "bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed"
                }`}
              />
            </div>
          </div>

          {/* LOCATION */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

            <div>
              <label className="block text-slate-700 text-xs font-bold mb-2">
                City
              </label>

              <input
                type="text"
                value={profileData.cityName}
                disabled={true}
                className="w-full bg-slate-50 border border-slate-200 px-4 h-11 rounded-xl outline-none text-slate-500 font-medium cursor-not-allowed capitalize"
              />
            </div>

            <div>
              <label className="block text-slate-700 text-xs font-bold mb-2">
                State
              </label>

              <input
                type="text"
                value={profileData.state}
                disabled={true}
                className="w-full bg-slate-50 border border-slate-200 px-4 h-11 rounded-xl outline-none text-slate-500 font-medium cursor-not-allowed capitalize"
              />
            </div>

            <div>
              <label className="block text-slate-700 text-xs font-bold mb-2">
                Zip / Postal Code
              </label>

              <input
                type="text"
                name="zipCode"
                value={profileData.zipCode}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full border px-4 h-11 rounded-xl outline-none font-medium transition duration-200 ${
                  isEditing
                    ? "bg-white border-emerald-500 text-slate-900 focus:ring-2 focus:ring-emerald-500/20"
                    : "bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed"
                }`}
              />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-slate-700 text-xs font-bold mb-2 flex items-center gap-1.5">
              <Info
                size={14}
                className="text-emerald-600"
              />
              Property Overview / Description
            </label>

            <textarea
              name="description"
              rows="4"
              value={profileData.description}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Provide a descriptive overview of your property, key amenities, and surroundings..."
              className={`w-full border p-4 rounded-2xl outline-none font-medium transition duration-200 resize-none leading-relaxed ${
                isEditing
                  ? "bg-white border-emerald-500 text-slate-900 focus:ring-2 focus:ring-emerald-500/20"
                  : "bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed"
              }`}
            />
          </div>
        </div>

        {/* ACTIONS */}
        {isEditing && (
          <div className="p-5 sm:px-8 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">

            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                fetchHotelProfile();
              }}
              className="h-11 px-5 bg-white border border-slate-300 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-50 transition duration-200 shadow-2xs cursor-pointer"
            >
              Discard Changes
            </button>

            <button
              type="submit"
              disabled={saving}
              className="h-11 px-7 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition duration-200 shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2
                    size={15}
                    className="animate-spin text-white"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={15} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default HotelProfile;
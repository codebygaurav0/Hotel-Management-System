import React, { useState } from "react";
import axios from "axios";
import {
  User,
  ShieldCheck,
  Fingerprint,
  Edit2,
  Save,
  X,
  Info,
  BadgeCheck,
  Loader2,
} from "lucide-react";
import { signupApi } from "../api"; // Adjust API import path as per project directory

const Profile = () => {
  // Helper to safely parse user data from localStorage
  const getStoredUser = () => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Profile payload parsing error:", error);
      return null;
    }
  };

  const user = getStoredUser();
  const token = localStorage.getItem("token");

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "Administrator",
    email: user?.email || "admin@system.com",
    role: user?.role || "admin",
  });

  const initials = (name) =>
    (name || "")
      .trim()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "AD";

  const handleSave = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      // Optional API call if profile updates are backed by API
      if (signupApi) {
        await axios.put(
          `${signupApi}user/update-profile`,
          { name: formData.name },
          { headers },
        );
      }

      // Sync updated details back into LocalStorage
      const updatedUser = { ...user, name: formData.name };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setIsEditing(false);
      alert("Profile details updated successfully.");
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert(
        error.response?.data?.message || "Failed to update profile details.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || "Administrator",
      email: user?.email || "admin@system.com",
      role: user?.role || "admin",
    });
  };

  return (
    <div className="max-w-[1000px] mx-auto text-[#232320] font-['Inter',sans-serif] pb-10">
      {/* Header Container */}
      <div className="mb-8">
        <p className="font-['IBM_Plex_Mono',monospace] text-[10px] font-semibold tracking-[0.2em] text-[#A2782E] mt-0 mb-2 uppercase">
          Identity Profile
        </p>
        <h2 className="font-['Space_Grotesk',sans-serif] text-[28px] font-bold text-[#1B2537] m-0 tracking-tight">
          Account Specifications
        </h2>
        <p className="text-[#7A7565] text-[13.5px] mt-1.5 mb-0">
          View your registered details and security authorization status.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 items-start">
        {/* Left Side: Avatar Panel */}
        <div className="bg-white border border-[#E1DECF] rounded-xl p-8 text-center shadow-sm flex flex-col items-center">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-[#1B2537] text-[#FFF9EC] flex items-center justify-center text-[32px] font-['Space_Grotesk',sans-serif] font-bold shadow-md border-4 border-white ring-1 ring-[#E1DECF] select-none">
              {initials(formData.name)}
            </div>
            <div
              className="absolute bottom-1 right-1 w-7 h-7 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-white"
              title="Verified Account"
            >
              <BadgeCheck size={16} />
            </div>
          </div>

          <h3 className="font-['Space_Grotesk',sans-serif] font-bold text-[20px] text-[#1B2537] mt-5 mb-0 line-clamp-1">
            {formData.name}
          </h3>
          <p className="font-['IBM_Plex_Mono',monospace] text-[10.5px] text-[#A2782E] mt-1.5 mb-0 uppercase tracking-widest font-semibold">
            {formData.role} account
          </p>

          <div className="w-full mt-8 pt-6 border-t border-[#E1DECF] text-left space-y-4 text-[13px]">
            <div className="flex items-center justify-between">
              <span className="text-[#7A7565] font-medium flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#A39C89]" /> Auth Level
              </span>
              <span className="font-semibold text-[#1B2537] bg-[#F5F4EF] px-2.5 py-1 border border-[#E1DECF] rounded-md text-[11px] font-['IBM_Plex_Mono',monospace] uppercase tracking-wider">
                Level 1 Admin
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#7A7565] font-medium flex items-center gap-2">
                <BadgeCheck size={16} className="text-[#A39C89]" /> Platform
                Status
              </span>
              <span className="font-bold text-green-700 bg-green-50 px-2.5 py-1 border border-green-200 rounded-md text-[11px] font-['IBM_Plex_Mono',monospace] uppercase tracking-wider">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Account Details Form Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-[#E1DECF] rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 sm:p-8">
              <h4 className="font-['Space_Grotesk',sans-serif] text-[18px] font-bold text-[#1B2537] mb-6 flex items-center gap-2">
                <User size={20} className="text-[#A2782E]" /> Personal
                Information
              </h4>

              <div className="grid sm:grid-cols-2 gap-6 text-[13.5px]">
                {/* Full Name */}
                <div>
                  <label className="block text-[11.5px] font-['IBM_Plex_Mono',monospace] font-semibold text-[#8C8676] uppercase tracking-widest mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={`w-full border px-4 py-3 rounded-lg outline-none font-medium transition-all ${
                      isEditing
                        ? "bg-white border-[#E1DECF] text-[#1B2537] focus:border-[#A2782E] shadow-sm"
                        : "bg-[#F9F8F4] border-transparent text-[#7A7565] cursor-not-allowed"
                    }`}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[11.5px] font-['IBM_Plex_Mono',monospace] font-semibold text-[#8C8676] uppercase tracking-widest mb-2">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    disabled
                    value={formData.email}
                    className="w-full bg-[#F9F8F4] border border-transparent px-4 py-3 rounded-lg outline-none text-[#7A7565] font-medium cursor-not-allowed"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-[11.5px] font-['IBM_Plex_Mono',monospace] font-semibold text-[#8C8676] uppercase tracking-widest mb-2">
                    System Role Access
                  </label>
                  <div className="w-full bg-[#F9F8F4] px-4 py-3 rounded-lg text-[#7A7565] font-['IBM_Plex_Mono',monospace] font-bold tracking-wider text-[12.5px] uppercase select-none">
                    {formData.role}
                  </div>
                </div>

                {/* ID */}
                <div>
                  <label className="block text-[11.5px] font-['IBM_Plex_Mono',monospace] font-semibold text-[#8C8676] uppercase tracking-widest mb-2">
                    Session Identity ID
                  </label>
                  <div className="w-full bg-[#F9F8F4] px-4 py-3 rounded-lg text-[#7A7565] font-mono text-[12px] truncate select-none flex items-center gap-2">
                    <Fingerprint size={16} className="text-[#A39C89]" />
                    {user?._id || "Unavailable node hash string"}
                  </div>
                </div>
              </div>
            </div>

            {/* Toggle Action Section */}
            <div className="p-6 bg-[#FCFBF9] border-t border-[#E1DECF] flex justify-end gap-3">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleCancel}
                    className="flex items-center gap-2 h-10 px-5 text-[13px] font-semibold rounded-lg bg-white border border-[#E1DECF] text-[#4A473D] hover:bg-[#F5F4EF] transition shadow-sm disabled:opacity-50"
                  >
                    <X size={16} /> Cancel
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-[#1B2537] text-[#FFF9EC] h-10 px-6 text-[13px] font-semibold rounded-lg hover:bg-[#0F1523] transition shadow-sm disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} /> Save Changes
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-white hover:bg-[#F9F8F4] border border-[#E1DECF] text-[#1B2537] h-10 px-6 text-[13px] font-semibold rounded-lg transition shadow-sm"
                >
                  <Edit2 size={16} /> Modify Information
                </button>
              )}
            </div>
          </div>

          {/* Guidelines info card for system administrators */}
          <div className="bg-[#FCFBF9] border border-l-4 border-l-[#A2782E] border-[#E1DECF] rounded-xl p-6 flex gap-4 shadow-sm">
            <Info className="text-[#A2782E] shrink-0 mt-0.5" size={24} />
            <div>
              <h5 className="font-['Space_Grotesk',sans-serif] font-bold text-[16px] text-[#1B2537] m-0 mb-1.5">
                System Guidelines Notice
              </h5>
              <p className="text-[#7A7565] text-[13px] leading-relaxed m-0 font-medium">
                Security credentials and primary login routing strings are
                dynamically allocated by the Super Admin authority. To alter
                core account variables like your registered email or global
                authority roles, please generate a ticket directly matching your
                tracking console protocol keys.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

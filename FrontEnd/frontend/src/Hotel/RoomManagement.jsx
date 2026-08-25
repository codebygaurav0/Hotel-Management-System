import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import { signupApi } from "../api";
import {
  Edit2,
  Loader2,
  BedDouble,
  Users,
  Hotel,
  ChevronDown,
  CheckSquare,
  XCircle,
  Info,
  UploadCloud,
  CheckCircle2,
  X,
  Trash2,
} from "lucide-react";
import { Toaster, toast } from "sonner";

const AMENITIES_OPTIONS = [
  "WiFi",
  "Air Conditioning",
  "TV",
  "Mini Bar",
  "Balcony",
  "Room Service",
  "Ocean View",
  "Coffee Maker",
];

const RoomManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const navigate = useNavigate();

  // State Management
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingSingleRoom, setLoadingSingleRoom] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    roomNumber: "",
    roomType: "Standard",
    pricePerNight: "",
    maxOccupancy: "2",
    totalBeds: "1",
    bedType: "Double",
    roomSize: "",
    description: "",
    isFeatured: false,
  });

  const [amenitiesList, setAmenitiesList] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);

  const fileInputRef = useRef(null);

  // File previews setup & cleanup
  useEffect(() => {
    if (selectedImages.length === 0) {
      setFilePreviews([]);
      return;
    }

    const objectUrls = selectedImages.map((file) => URL.createObjectURL(file));
    setFilePreviews(objectUrls);

    // Memory leak prevention
    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedImages]);

  // Sync state with Edit query params
  useEffect(() => {
    fetchRoomsInventory();

    if (editId) {
      fetchSingleRoomForEdit(editId);
    } else {
      resetForm();
    }
  }, [editId]);

  const resetForm = () => {
    setFormData({
      roomNumber: "",
      roomType: "Standard",
      pricePerNight: "",
      maxOccupancy: "2",
      totalBeds: "1",
      bedType: "Double",
      roomSize: "",
      description: "",
      isFeatured: false,
    });
    setAmenitiesList([]);
    setExistingImages([]);
    setSelectedImages([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // API Call: Fetch all rooms
  const fetchRoomsInventory = async () => {
    try {
      setLoadingRooms(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${signupApi}room/myRooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(response.data?.rooms || response.data || []);
    } catch (error) {
      toast.error("Failed to fetch rooms inventory");
    } finally {
      setLoadingRooms(false);
    }
  };

  // API Call: Fetch single room details for editing
  const fetchSingleRoomForEdit = async (id) => {
    try {
      setLoadingSingleRoom(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${signupApi}room/view/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const room = response.data?.room || response.data;

      if (room) {
        setFormData({
          roomNumber: room.roomNumber || "",
          roomType: room.roomType || "Standard",
          pricePerNight: room.pricePerNight || "",
          maxOccupancy: room.maxOccupancy || "2",
          totalBeds: room.totalBeds || "1",
          bedType: room.bedType || "Double",
          roomSize: room.roomSize || "",
          description: room.description || "",
          isFeatured: room.isFeatured || false,
        });
        setAmenitiesList(room.roomAmenities || []);
        setExistingImages(room.roomImages || []);
      }
    } catch (error) {
      toast.error("Failed to load room details");
    } finally {
      setLoadingSingleRoom(false);
    }
  };

  // Form Inputs Handler
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Amenities Selection Handler
  const handleAmenityToggle = (amenity) => {
    setAmenitiesList((prev) =>
      prev.includes(amenity)
        ? prev.filter((item) => item !== amenity)
        : [...prev, amenity],
    );
  };

  // Image File Select Handler
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setSelectedImages((prev) => [...prev, ...files]);
    }
  };

  // Remove newly added local image
  const handleRemoveSelectedFile = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove existing network image (When editing)
  const handleRemoveExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Cancel Editing Action
  const handleCancelEdit = () => {
    searchParams.delete("edit");
    setSearchParams(searchParams);
    resetForm();
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const dataPayload = new FormData();
      Object.keys(formData).forEach((key) => {
        dataPayload.append(key, formData[key]);
      });

      // Append Amenities as roomAmenities (multiple values)
      amenitiesList.forEach((item) => dataPayload.append("roomAmenities", item));

      // Append Existing Images (If editing) as JSON under roomImages
      if (editId) dataPayload.append("roomImages", JSON.stringify(existingImages));

      // Append New Images as roomImages files
      selectedImages.forEach((file) => {
        dataPayload.append("roomImages", file);
      });

      const token = localStorage.getItem("token");

      if (editId) {
        await axios.put(`${signupApi}room/update/${editId}`, dataPayload, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
        toast.success("Room updated successfully!");
        handleCancelEdit();
      } else {
        await axios.post(`${signupApi}room/create`, dataPayload, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
        toast.success("New room created successfully!");
        resetForm();
      }

      fetchRoomsInventory();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to save room details",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <Toaster position="top-right" richColors />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Hotel className="w-7 h-7 text-indigo-600" />
              Room Management System
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Add, update and manage hotel room inventories seamlessly.
            </p>
          </div>
          {editId && (
            <button
              onClick={handleCancelEdit}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              <XCircle className="w-4 h-4" /> Cancel Editing
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2 border-b pb-4">
              {editId ? (
                <Edit2 className="w-5 h-5 text-indigo-600" />
              ) : (
                <UploadCloud className="w-5 h-5 text-indigo-600" />
              )}
              {editId ? "Update Existing Room" : "Add New Room"}
            </h2>

            {loadingSingleRoom ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
                <p>Loading room details...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Room Number *
                    </label>
                    <input
                      type="text"
                      name="roomNumber"
                      required
                      value={formData.roomNumber}
                      onChange={handleChange}
                      placeholder="e.g. 101"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Room Type
                    </label>
                    <select
                      name="roomType"
                      value={formData.roomType}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition bg-white"
                    >
                      <option value="Standard">Standard</option>
                      <option value="Deluxe">Deluxe</option>
                      <option value="Executive Suite">Executive Suite</option>
                      <option value="Presidential Suite">
                        Presidential Suite
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Price / Night ($) *
                    </label>
                    <input
                      type="number"
                      name="pricePerNight"
                      required
                      value={formData.pricePerNight}
                      onChange={handleChange}
                      placeholder="e.g. 150"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Max Occupancy
                    </label>
                    <input
                      type="number"
                      name="maxOccupancy"
                      value={formData.maxOccupancy}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Total Beds
                    </label>
                    <input
                      type="number"
                      name="totalBeds"
                      value={formData.totalBeds}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Bed Type
                    </label>
                    <select
                      name="bedType"
                      value={formData.bedType}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition bg-white"
                    >
                      <option value="Single">Single</option>
                      <option value="Double">Double</option>
                      <option value="Queen">Queen</option>
                      <option value="King">King</option>
                    </select>
                  </div>
                </div>

                {/* Size & Description */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Room Size (sq ft)
                    </label>
                    <input
                      type="text"
                      name="roomSize"
                      value={formData.roomSize}
                      onChange={handleChange}
                      placeholder="e.g. 350 sq ft"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      rows="3"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Brief details about room view, interior, etc."
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition resize-none"
                    ></textarea>
                  </div>
                </div>

                {/* Featured Toggle */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <label
                    htmlFor="isFeatured"
                    className="text-sm font-medium text-slate-700 cursor-pointer"
                  >
                    Highlight as Featured Room
                  </label>
                </div>

                {/* Amenities Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Amenities
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AMENITIES_OPTIONS.map((item) => {
                      const isSelected = amenitiesList.includes(item);
                      return (
                        <button
                          type="button"
                          key={item}
                          onClick={() => handleAmenityToggle(item)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {isSelected && (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Image Upload Area */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Upload Room Images
                  </label>
                  <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-6 text-center transition bg-slate-50/50 cursor-pointer relative">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-700">
                      Click or drag images to upload
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      PNG, JPG, WEBP up to 5MB
                    </p>
                  </div>

                  {/* Previews: Existing Images (Editing Mode) */}
                  {existingImages.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-medium text-slate-500 mb-2">
                        Saved Images:
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {existingImages.map((url, idx) => (
                          <div
                            key={idx}
                            className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 group"
                          >
                            <img
                              src={url}
                              alt="saved"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveExistingImage(idx)}
                              className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Previews: Newly Selected Images */}
                  {filePreviews.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-medium text-slate-500 mb-2">
                        New Images Selected:
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {filePreviews.map((url, idx) => (
                          <div
                            key={idx}
                            className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 group"
                          >
                            <img
                              src={url}
                              alt="staged"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveSelectedFile(idx)}
                              className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                      </>
                    ) : editId ? (
                      "Update Room"
                    ) : (
                      "Save Room"
                    )}
                  </button>

                  {editId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="py-3 px-4 border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* Room List / Inventory View */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2 border-b pb-4">
              <Hotel className="w-5 h-5 text-indigo-600" />
              Rooms List ({rooms.length})
            </h2>

            {loadingRooms ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
                <p>Fetching inventory...</p>
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Info className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No rooms added yet.</p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[700px] pr-1">
                {rooms.map((room) => (
                  <div
                    key={room._id || room.id}
                    className={`p-4 rounded-xl border transition flex items-center justify-between ${
                      editId === (room._id || room.id)
                        ? "border-indigo-600 bg-indigo-50/30"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">
                          Room #{room.roomNumber}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {room.roomType}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <BedDouble className="w-3.5 h-3.5" /> {room.bedType}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" /> Max:{" "}
                          {room.maxOccupancy}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-indigo-600 mt-1">
                        ${room.pricePerNight}{" "}
                        <span className="text-xs font-normal text-slate-400">
                          / night
                        </span>
                      </p>
                    </div>

                    <button
                      onClick={() => navigate(`?edit=${room._id || room.id}`)}
                      className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      title="Edit Room"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomManagement;

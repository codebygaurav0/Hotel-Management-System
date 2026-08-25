const roomModel = require("../Model/roomsModel");
const hotelModel = require("../Model/hotelModel");
const { uploadImage } = require("../Utilities/Cloudinary");

// CREATE ROOM
const createRoom = async (req, res) => {
    try {
        let { roomNumber, roomType, pricePerNight, maxOccupancy, totalBeds, bedType, roomSize, description, roomAmenities, isFeatured } = req.body;

        const hotel = await hotelModel.findOne({ hotelEmail: req.user.email });
        if (!hotel || hotel.status !== "Approved") {
            return res.status(400).json({ success: false, message: "Hotel not found or not approved." });
        }

        if (!roomNumber || !roomType || !pricePerNight || !maxOccupancy || !totalBeds || !bedType) {
            return res.status(400).json({ success: false, message: "All required fields are mandatory." });
        }

        const existingRoom = await roomModel.findOne({ hotelId: hotel._id, roomNumber: roomNumber.trim() });
        if (existingRoom) return res.status(409).json({ success: false, message: "Room number already exists." });

        if (!req.files || !req.files.roomImages) return res.status(400).json({ success: false, message: "Images required." });

        const uploadedImages = await uploadImage(req.files.roomImages, "hotel-management/rooms");
        const roomImages = uploadedImages.map((image) => image.secure_url);

        if (typeof roomAmenities === "string") {
            roomAmenities = roomAmenities.split(",").map((item) => item.trim()).filter(Boolean);
        }

        const room = await roomModel.create({
            hotelId: hotel._id,
            roomNumber: roomNumber.trim(),
            roomType, pricePerNight, maxOccupancy, totalBeds, bedType, roomSize, description, roomAmenities, roomImages,
            isFeatured: isFeatured === true || isFeatured === "true",
        });

        return res.status(201).json({ success: true, message: "Room created successfully.", room });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// GET MY ROOMS
const getMyRooms = async (req, res) => {
  try {
    const hotel = await hotelModel.findOne({ hotelEmail: req.user.email });
    if (!hotel)
      return res
        .status(404)
        .json({ success: false, message: "Hotel not found." });

    // Query parameters extract karein jo frontend se aayenge
    const { search, status, sortBy } = req.query;

    // Base query: Sirf is hotel ke rooms fetch honge
    let query = { hotelId: hotel._id };

    // 1. Status Filter Logic
    if (status && status !== "All") {
      if (status === "Active") query.isActive = true;
      if (status === "Inactive") query.isActive = false;
    }

    // 2. Search Logic (Room number ya room type ke basis par)
    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i"); 
      query.$or = [
        { roomType: searchRegex },
        { roomNumber: searchRegex }, 
      ];
    }

    let roomsQuery = roomModel.find(query);

    if (sortBy === "price-low-high") {
      roomsQuery = roomsQuery.sort({ pricePerNight: 1 }); 
    } else if (sortBy === "price-high-low") {
      roomsQuery = roomsQuery.sort({ pricePerNight: -1 }); 
    } else if (sortBy === "room-asc") {
      roomsQuery = roomsQuery.sort({ roomNumber: 1 }); 
    } else {
      roomsQuery = roomsQuery.sort({ createdAt: -1 });
    }

    const rooms = await roomsQuery.exec();

    return res.status(200).json({
      success: true,
      totalRooms: rooms.length,
      rooms,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// VIEW SINGLE ROOM (GET BY ID)
const viewRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const room = await roomModel.findById(roomId);

        if (!room) return res.status(404).json({ success: false, message: "Room not found." });

        return res.status(200).json({ success: true, room });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// UPDATE ROOM
const updateRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        let updateData = req.body;

        const hotel = await hotelModel.findOne({ hotelEmail: req.user.email });
        const room = await roomModel.findById(roomId);

        if (!room || room.hotelId.toString() !== hotel._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized." });
        }

        if (req.files && req.files.roomImages) {
            const uploadedImages = await uploadImage(req.files.roomImages, "hotel-management/rooms");
            updateData.roomImages = uploadedImages.map(img => img.secure_url);
        }

        if (typeof updateData.roomAmenities === "string") {
            updateData.roomAmenities = updateData.roomAmenities.split(",").map(i => i.trim());
        }

        const updatedRoom = await roomModel.findByIdAndUpdate(roomId, updateData, { new: true });
        return res.status(200).json({ success: true, message: "Room updated.", room: updatedRoom });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE ROOM
const deleteRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const hotel = await hotelModel.findOne({ hotelEmail: req.user.email });
        const room = await roomModel.findById(roomId);

        if (!room || room.hotelId.toString() !== hotel._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized." });
        }

        await roomModel.findByIdAndDelete(roomId);
        return res.status(200).json({ success: true, message: "Room deleted." });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// TOGGLE STATUS
const toggleRoomStatus = async (req, res) => {
    try {
        const { roomId } = req.params;
        const hotel = await hotelModel.findOne({ hotelEmail: req.user.email });
        const room = await roomModel.findById(roomId);

        if (!room || room.hotelId.toString() !== hotel._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized." });
        }

        room.isActive = !room.isActive;
        await room.save();
        return res.status(200).json({ success: true, message: `Room is now ${room.isActive ? 'Active' : 'Inactive'}` });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getPublicRoomsByHotel = async (req, res) => {
    try {
        const { hotelId } = req.params;

        // Fetch only Active rooms for this specific hotel
        const rooms = await roomModel.find({
            hotelId: hotelId,
            isActive: true
        }).sort({ pricePerNight: 1 }); // Saste rooms pehle dikhayenge

        return res.status(200).json({ success: true, rooms });
    } catch (error) {
        console.log("Public Rooms Error :", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { createRoom, getMyRooms, viewRoom, updateRoom, deleteRoom, toggleRoomStatus, getPublicRoomsByHotel };
const Booking = require("../Model/bookingModel");
const Room = require("../Model/roomsModel");
const Coupon = require("../Model/couponModel");
const Hotel = require("../Model/hotelModel");
const temporaryModel = require("../Model/temporaryModel");
const dayjs = require("dayjs");

// Helper: FetchAccessible Hotel IDs for Admin/Hotel Admin
const getAccessibleHotelIds = async (user) => {
  if (user.role === "hotel") {
    const hotel = await Hotel.findOne({ hotelEmail: user.email });
    return hotel ? [hotel._id] : [];
  }
  if (user.role === "admin") {
    const hotels = await Hotel.find({ adminId: user._id });
    return hotels.map((h) => h._id);
  }
  return [];
};

// 1. CREATE BOOKING
const createBooking = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const {
      roomId,
      checkIn,
      checkOut,
      totalGuests,
      couponCode,
      specialRequest,
    } = req.body;

    if (!roomId || !checkIn || !checkOut || !totalGuests) {
      return res
        .status(400)
        .json({
          success: false,
          message: "All required fields are mandatory.",
        });
    }

    const room = await Room.findById(roomId);
    if (!room)
      return res
        .status(404)
        .json({ success: false, message: "Room not found." });
    if (!room.isActive)
      return res
        .status(400)
        .json({ success: false, message: "Room is inactive." });
    if (room.bookingStatus === "Maintenance")
      return res
        .status(400)
        .json({ success: false, message: "Room is under maintenance." });

    if (Number(totalGuests) > room.maxOccupancy) {
      return res
        .status(400)
        .json({
          success: false,
          message: `Maximum ${room.maxOccupancy} guests allowed.`,
        });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      return res
        .status(400)
        .json({ success: false, message: "Check-out must be after Check-in." });
    }

    // FIX: Verify specific user's active temporary hold
    const userHold = await temporaryModel.findOne({
      userId,
      roomId,
      expiresAt: { $gt: new Date() }, // Active hold check
    });

    if (!userHold) {
      return res.status(400).json({
        success: false,
        message:
          "Reservation session expired or invalid hold. Please select dates again.",
      });
    }

    // Check Overlapping Confirmed/Pending Bookings
    const existingBooking = await Booking.findOne({
      roomId,
      bookingStatus: { $in: ["Pending", "Confirmed", "Checked In"] },
      checkIn: { $lt: checkOutDate },
      checkOut: { $gt: checkInDate },
    });

    if (existingBooking) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Room is already booked for selected dates.",
        });
    }

    // Calculate Nights and Pricing
    const milliseconds = checkOutDate.getTime() - checkInDate.getTime();
    const totalNights = Math.ceil(milliseconds / (1000 * 60 * 60 * 24));
    const roomPrice = room.pricePerNight;
    const totalAmount = roomPrice * totalNights;

    let couponId = null;
    let appliedCouponCode = "";
    let discount = 0;
    let finalAmount = totalAmount;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        couponCode: couponCode.trim().toUpperCase(),
        status: "Active",
      });

      if (!coupon)
        return res
          .status(400)
          .json({ success: false, message: "Invalid coupon code." });

      if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
        return res
          .status(400)
          .json({ success: false, message: "Coupon expired." });
      }

      couponId = coupon._id;
      appliedCouponCode = coupon.couponCode;

      if (coupon.discountPercentage) {
        discount = (totalAmount * coupon.discountPercentage) / 100;
      } else if (coupon.discountAmount) {
        discount = coupon.discountAmount;
      }

      if (discount > totalAmount) discount = totalAmount;
      finalAmount = totalAmount - discount;
    }

    const bookingId =
      "BK" + Date.now() + Math.floor(1000 + Math.random() * 9000);

    const booking = await Booking.create({
      bookingId,
      userId,
      hotelId: room.hotelId,
      roomId,
      roomPrice,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalGuests,
      totalNights,
      totalAmount,
      couponId,
      couponCode: appliedCouponCode,
      discount,
      finalAmount,
      specialRequest: specialRequest || "",
      bookingStatus: "Pending",
      paymentStatus: "Pending",
      paymentMethod: "Cash",
    });

    // Clear only this specific temporary hold
    await temporaryModel.deleteOne({ _id: userHold._id });

    const result = await Booking.findById(booking._id)
      .populate("userId", "name email mobile")
      .populate("hotelId", "hotelName hotelEmail address city")
      .populate("roomId");

    return res.status(201).json({
      success: true,
      message:
        "Booking request sent successfully. Waiting for hotel confirmation.",
      booking: result,
    });
  } catch (error) {
    console.error("Create Booking Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. GET MY BOOKINGS (Customer)
const getMyBookings = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const bookings = await Booking.find({ userId })
      .populate("hotelId", "hotelName hotelImages address city hotelType")
      .populate("roomId", "roomNumber roomType pricePerNight roomImages")
      .populate("review")
      .sort({ createdAt: -1 });

    return res
      .status(200)
      .json({ success: true, totalBookings: bookings.length, bookings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. GET BOOKING DETAILS BY ID
const getBookingDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id || req.user.id;

    const booking = await Booking.findOne({ _id: bookingId, userId })
      .populate(
        "hotelId",
        "hotelName hotelEmail hotelImages address description hotelType amenities",
      )
      .populate(
        "roomId",
        "roomNumber roomType roomImages roomSize bedType totalBeds maxOccupancy pricePerNight description roomAmenities",
      )
      .populate("userId", "name email mobile")
      .populate("review");

    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found." });

    return res.status(200).json({ success: true, booking });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 4. GET BOOKINGS FOR HOTEL / ADMIN
// GET BOOKINGS FOR HOTEL / ADMIN (With Search, Filter & Sorting)
const getHotelBookings = async (req, res) => {
    try {
        const hotelIds = await getAccessibleHotelIds(req.user);

        if (hotelIds.length === 0) {
            return res.status(403).json({ success: false, message: "Unauthorized or no hotels associated." });
        }

        // Query parameters receive karein: ?search=BK123&status=Pending&sortBy=checkIn&order=asc
        const { search, status, sortBy, order } = req.query;

        // Base Query (Access controlled)
        let query = { hotelId: { $in: hotelIds } };

        // 1. Status Filter (e.g. Pending, Confirmed, Cancelled, Checked In)
        if (status) {
            query.bookingStatus = status;
        }

        // 2. Search Logic (Booking ID ya Coupon Code par search karne ke liye)
        if (search) {
            query.$or = [
                { bookingId: { $regex: search, $options: "i" } },
                { couponCode: { $regex: search, $options: "i" } }
            ];
        }

        // 3. Dynamic Sorting Logic
        let sortOptions = { createdAt: -1 }; // Default: Latest bookings pehle
        if (sortBy) {
            const sortOrder = order === "asc" ? 1 : -1;
            sortOptions[sortBy] = sortOrder; // e.g., 'checkIn', 'totalAmount', 'createdAt'
        }

        const bookings = await Booking.find(query)
            .populate("hotelId", "hotelName hotelEmail")
            .populate("userId", "name email mobile")
            .populate("roomId", "roomNumber roomType pricePerNight roomImages")
            .populate("review")
            .sort(sortOptions);

        return res.status(200).json({ 
            success: true, 
            totalBookings: bookings.length, 
            bookings 
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
// 5. CONFIRM BOOKING
const confirmBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);

    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found." });

    const hotelIds = await getAccessibleHotelIds(req.user);
    if (!hotelIds.some((id) => id.toString() === booking.hotelId.toString())) {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }

    if (booking.bookingStatus !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot confirm booking in '${booking.bookingStatus}' status.`,
      });
    }

    booking.bookingStatus = "Confirmed";
    await booking.save();

    const result = await Booking.findById(booking._id)
      .populate("userId", "name email mobile")
      .populate("hotelId", "hotelName hotelEmail")
      .populate("roomId", "roomNumber roomType pricePerNight");

    return res
      .status(200)
      .json({
        success: true,
        message: "Booking confirmed successfully.",
        booking: result,
      });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 6. CHECK-IN BOOKING
const checkInBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);

    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found." });

    const hotelIds = await getAccessibleHotelIds(req.user);
    if (!hotelIds.some((id) => id.toString() === booking.hotelId.toString())) {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }

    if (booking.bookingStatus !== "Confirmed") {
      return res.status(400).json({
        success: false,
        message: `Only 'Confirmed' bookings can be checked in. Current status: ${booking.bookingStatus}`,
      });
    }

    booking.bookingStatus = "Checked In";
    await booking.save();

    const result = await Booking.findById(booking._id)
      .populate("userId", "name email mobile")
      .populate("hotelId", "hotelName hotelEmail")
      .populate("roomId", "roomNumber roomType pricePerNight");

    return res
      .status(200)
      .json({
        success: true,
        message: "Guest checked in successfully.",
        booking: result,
      });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 7. COMPLETE BOOKING
const completeBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);

    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found." });

    const hotelIds = await getAccessibleHotelIds(req.user);
    if (!hotelIds.some((id) => id.toString() === booking.hotelId.toString())) {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }

    if (booking.bookingStatus !== "Checked In") {
      return res.status(400).json({
        success: false,
        message: `Only 'Checked In' bookings can be completed. Current status: ${booking.bookingStatus}`,
      });
    }

    booking.bookingStatus = "Completed";
    await booking.save();

    const result = await Booking.findById(booking._id)
      .populate("userId", "name email mobile")
      .populate("hotelId", "hotelName hotelEmail")
      .populate("roomId", "roomNumber roomType pricePerNight");

    return res
      .status(200)
      .json({
        success: true,
        message: "Booking completed successfully.",
        booking: result,
      });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 8. GET BOOKED DATES
const getBookedDates = async (req, res) => {
  try {
    const { roomId } = req.params;

    const bookings = await Booking.find({
      roomId,
      bookingStatus: { $in: ["Pending", "Confirmed", "Checked In"] },
    }).select("checkIn checkOut");

    const bookedDates = [];

    bookings.forEach((booking) => {
      let current = dayjs(booking.checkIn);
      const checkOut = dayjs(booking.checkOut);

      while (current.isBefore(checkOut, "day")) {
        bookedDates.push(current.toDate());
        current = current.add(1, "day");
      }
    });

    return res.status(200).json({ success: true, bookedDates });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

// 9. CANCEL BOOKING
const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id || req.user.id;
    const userRole = req.user.role;

    const booking = await Booking.findById(bookingId);
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found." });

    let isAllowed = false;

    if (booking.userId.toString() === userId.toString()) {
      isAllowed = true;
    } else if (["hotel", "admin"].includes(userRole)) {
      const hotelIds = await getAccessibleHotelIds(req.user);
      if (hotelIds.some((id) => id.toString() === booking.hotelId.toString())) {
        isAllowed = true;
      }
    }

    if (!isAllowed) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Unauthorized to cancel this booking.",
        });
    }

    if (["Completed", "Cancelled"].includes(booking.bookingStatus)) {
      return res.status(400).json({
        success: false,
        message: `Booking cannot be cancelled as it is already ${booking.bookingStatus}.`,
      });
    }

    if (booking.bookingStatus === "Checked In" && userRole === "user") {
      return res.status(400).json({
        success: false,
        message:
          "Customers cannot cancel after Check-In. Please contact reception.",
      });
    }

    booking.bookingStatus = "Cancelled";
    booking.cancelReason =
      userRole === "user"
        ? "Cancelled by customer"
        : "Cancelled by hotel management";

    await booking.save();

    return res
      .status(200)
      .json({
        success: true,
        message: "Booking cancelled successfully.",
        booking,
      });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingDetails,
  getHotelBookings,
  confirmBooking,
  checkInBooking,
  completeBooking,
  getBookedDates,
  cancelBooking,
};

const Booking = require('../Model/bookingModel');
const Room = require('../Model/roomsModel');
const Hotel = require('../Model/hotelModel');
const Review = require('../Model/reviewModel');

const getAccessibleHotelIds = async (user) => {
    if (user.role === "hotel") {
        const hotel = await Hotel.findOne({ hotelEmail: user.email });
        return hotel ? [hotel._id] : [];
    }
    if (user.role === "admin") {
        const hotels = await Hotel.find({ adminId: user._id });
        return hotels.map(h => h._id);
    }
    return [];
};

exports.getDashboardSummary = async (req, res) => {
    try {
        const hotelIds = await getAccessibleHotelIds(req.user);

        if (hotelIds.length === 0) {
            return res.status(404).json({ success: false, message: "No hotels found for this user." });
        }

        // Get Today's Date boundaries
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        // 1. Total Rooms & Occupied Rooms
        const totalRooms = await Room.countDocuments({ hotelId: { $in: hotelIds } });

        const occupiedRoomsCount = await Booking.countDocuments({
            hotelId: { $in: hotelIds },
            bookingStatus: "Checked In"
        });

        const availableRoomsCount = totalRooms - occupiedRoomsCount;

        // 2. Today's Bookings & Revenue
        const todayBookingsList = await Booking.find({
            hotelId: { $in: hotelIds },
            createdAt: { $gte: startOfToday, $lte: endOfToday },
            bookingStatus: { $ne: "Cancelled" }
        });

        const todayBookings = todayBookingsList.length;
        const todayRevenue = todayBookingsList.reduce((sum, b) => sum + (b.finalAmount || 0), 0);

        // 3. Today's Check-ins & Check-outs
        const todayCheckIns = await Booking.countDocuments({
            hotelId: { $in: hotelIds },
            checkIn: { $gte: startOfToday, $lte: endOfToday },
            bookingStatus: { $in: ["Confirmed", "Checked In"] }
        });

        const todayCheckOuts = await Booking.countDocuments({
            hotelId: { $in: hotelIds },
            checkOut: { $gte: startOfToday, $lte: endOfToday },
            bookingStatus: { $in: ["Checked In", "Completed"] }
        });

        // 4. Recent Bookings for Table
        const recentBookings = await Booking.find({ hotelId: { $in: hotelIds } })
            .sort({ createdAt: -1 })
            .limit(6)
            .populate('userId', 'name email')
            .populate('roomId', 'roomType roomNumber');

        // 5. Reviews & Ratings Logic
        const recentReviews = await Review.find({ hotelId: { $in: hotelIds } })
            .sort({ createdAt: -1 })
            .limit(4)
            .populate('userId', 'name');

        const reviewStats = await Review.aggregate([
            { $match: { hotelId: { $in: hotelIds } } },
            {
                $group: {
                    _id: null,
                    totalReviews: { $sum: 1 },
                    avgCleanliness: { $avg: "$cleanliness" },
                    avgStaff: { $avg: "$staff" },
                    avgLocation: { $avg: "$location" },
                    avgValueForMoney: { $avg: "$valueForMoney" }
                }
            }
        ]);

        let ratingSummary = {
            averageRating: 0,
            totalReviews: 0,
            categories: { cleanliness: 0, staff: 0, location: 0, valueForMoney: 0 }
        };

        if (reviewStats.length > 0) {
            const stats = reviewStats[0];
            const avgOverall = (stats.avgCleanliness + stats.avgStaff + stats.avgLocation + stats.avgValueForMoney) / 4;

            ratingSummary = {
                averageRating: Math.round(avgOverall * 10) / 10,
                totalReviews: stats.totalReviews,
                categories: {
                    cleanliness: Math.round(stats.avgCleanliness * 10) / 10,
                    staff: Math.round(stats.avgStaff * 10) / 10,
                    location: Math.round(stats.avgLocation * 10) / 10,
                    valueForMoney: Math.round(stats.avgValueForMoney * 10) / 10
                }
            };
        }

        // 6. Monthly Revenue Analytics
        const currentYear = new Date().getFullYear();
        const revenueAggregation = await Booking.aggregate([
            {
                $match: {
                    hotelId: { $in: hotelIds },
                    bookingStatus: { $ne: "Cancelled" },
                    createdAt: {
                        $gte: new Date(`${currentYear}-01-01`),
                        $lte: new Date(`${currentYear}-12-31T23:59:59.999Z`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    revenue: { $sum: "$finalAmount" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyRevenue = monthNames.map((name, index) => {
            const found = revenueAggregation.find(item => item._id === index + 1);
            return { name, revenue: found ? found.revenue : 0 };
        });

        // 7. Weekly Booking Trend
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const bookingTrendAggregation = await Booking.aggregate([
            {
                $match: {
                    hotelId: { $in: hotelIds },
                    bookingStatus: { $ne: "Cancelled" },
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    bookings: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const bookingTrend = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

            const found = bookingTrendAggregation.find(item => item._id === dateStr);
            bookingTrend.push({ day: dayName, bookings: found ? found.bookings : 0 });
        }

        res.status(200).json({
            success: true,
            summary: {
                totalRooms,
                availableRooms: availableRoomsCount > 0 ? availableRoomsCount : 0,
                occupiedRooms: occupiedRoomsCount,
                todayBookings,
                todayRevenue,
                todayCheckIns,
                todayCheckOuts,
            },
            monthlyRevenue,
            bookingTrend,
            roomStatus: [
                { name: "Available", value: availableRoomsCount > 0 ? availableRoomsCount : 0 },
                { name: "Occupied", value: occupiedRoomsCount }
            ],
            recentBookings,
            ratingSummary,
            recentReviews
        });

    } catch (error) {
        console.error("Dashboard API Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard summary.",
            error: error.message
        });
    }
};

exports.getPlatformAnalytics = async (req, res) => {
    try {
        // 1. KPI Counts
        const totalHotels = await Hotel.countDocuments();

        const totalRoomsResult = await Room.countDocuments();
        const totalRooms = totalRoomsResult || 0;

        const totalBookings = await Booking.countDocuments();
        const totalCustomers = await Booking.distinct("userId").then(users => users.length);

        const revenueResult = await Booking.aggregate([
            { $match: { bookingStatus: { $in: ["Confirmed", "Completed", "Checked In"] } } },
            { $group: { _id: null, totalRevenue: { $sum: "$finalAmount" } } }
        ]);
        const totalRevenue = revenueResult[0]?.totalRevenue || 0;

        // Average Rating from Review Collection
        const reviewStats = await Review.aggregate([
            {
                $group: {
                    _id: null,
                    avgCleanliness: { $avg: "$cleanliness" },
                    avgStaff: { $avg: "$staff" },
                    avgLocation: { $avg: "$location" },
                    avgValueForMoney: { $avg: "$valueForMoney" }
                }
            }
        ]);

        let averageRating = 4.5;
        if (reviewStats.length > 0) {
            const s = reviewStats[0];
            const avg = (s.avgCleanliness + s.avgStaff + s.avgLocation + s.avgValueForMoney) / 4;
            averageRating = Math.round(avg * 10) / 10;
        }

        // Occupancy Rate using Room Collection status ("Booked")
        const bookedRoomsCount = await Room.countDocuments({ bookingStatus: "Booked" });
        const occupancyRate = totalRooms > 0 ? Math.round((bookedRoomsCount / totalRooms) * 100) : 0;

        // 2. Revenue Trend (Month-wise Area Chart)
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const revenueAggregation = await Booking.aggregate([
            { $match: { bookingStatus: { $in: ["Confirmed", "Completed", "Checked In"] } } },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    revenue: { $sum: "$finalAmount" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const monthlyRevenue = monthNames.map((name, index) => {
            const found = revenueAggregation.find(item => item._id === index + 1);
            return { name, revenue: found ? found.revenue : 0 };
        });

        // 3. Booking Trend (Last 7 Days Bar Chart)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const bookingTrendRaw = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: sevenDaysAgo },
                    bookingStatus: { $ne: "Cancelled" }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt"
                        }
                    },
                    bookings: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const bookingTrend = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split("T")[0];
            const day = d.toLocaleDateString("en-US", { weekday: "short" });
            const found = bookingTrendRaw.find(x => x._id === dateStr);
            bookingTrend.push({
                day,
                bookings: found ? found.bookings : 0
            });
        }

        // 4. Booking Status Breakdown (Donut Chart)
        const bookingStatusRaw = await Booking.aggregate([
            {
                $group: {
                    _id: "$bookingStatus",
                    value: { $sum: 1 }
                }
            }
        ]);

        const bookingStatusBreakdown = bookingStatusRaw.map(item => ({
            name: item._id || "Unknown",
            value: item.value
        }));

        // 5. Hotels by City (Bar Chart)
        const hotelsByCity = await Hotel.aggregate([
            {
                $lookup: {
                    from: "cities",
                    localField: "city",
                    foreignField: "_id",
                    as: "cityInfo"
                }
            },
            { $unwind: { path: "$cityInfo", preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: { $ifNull: ["$cityInfo.cityName", "$city"] },
                    count: { $sum: 1 }
                }
            },
            { $project: { city: { $toString: "$_id" }, count: 1, _id: 0 } }
        ]);

        // 6. New Hotel Registrations Trend (Line Chart)
        const regAggregation = await Hotel.aggregate([
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    hotels: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const newRegistrations = monthNames.map((month, index) => {
            const found = regAggregation.find(item => item._id === index + 1);
            return { month, hotels: found ? found.hotels : 0 };
        });

        // 7. Top Performing Hotels by Revenue
        const topHotelsRaw = await Booking.aggregate([
            { $match: { bookingStatus: { $in: ["Confirmed", "Completed", "Checked In"] } } },
            {
                $group: {
                    _id: "$hotelId",
                    revenue: { $sum: "$finalAmount" }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "hotels",
                    localField: "_id",
                    foreignField: "_id",
                    as: "hotelInfo"
                }
            },
            { $unwind: "$hotelInfo" },
            {
                $project: {
                    name: "$hotelInfo.hotelName",
                    revenue: 1,
                    _id: 0
                }
            }
        ]);

        // 8. Real Occupancy Comparison per Hotel using Room Collection
        const occupancyComparison = await Hotel.aggregate([
            {
                $lookup: {
                    from: "rooms",
                    localField: "_id",
                    foreignField: "hotelId",
                    as: "rooms"
                }
            },
            {
                $project: {
                    hotel: "$hotelName",
                    totalRooms: { $size: "$rooms" },
                    bookedRooms: {
                        $size: {
                            $filter: {
                                input: "$rooms",
                                as: "room",
                                cond: { $eq: ["$$room.bookingStatus", "Booked"] }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    hotel: 1,
                    occupancy: {
                        $cond: [
                            { $gt: ["$totalRooms", 0] },
                            {
                                $round: [
                                    {
                                        $multiply: [
                                            { $divide: ["$bookedRooms", "$totalRooms"] },
                                            100
                                        ]
                                    },
                                    0
                                ]
                            },
                            0
                        ]
                    }
                }
            },
            { $limit: 6 }
        ]);

        res.status(200).json({
            success: true,
            analytics: {
                kpis: {
                    totalHotels,
                    totalRooms,
                    totalBookings,
                    totalCustomers,
                    totalRevenue,
                    activeOwners: totalHotels,
                    averageRating,
                    occupancyRate
                },
                monthlyRevenue,
                bookingTrend,
                bookingStatusBreakdown,
                hotelsByCity,
                newRegistrations,
                topPerformingHotels: topHotelsRaw,
                occupancyComparison
            }
        });

    } catch (error) {
        console.error("Platform Analytics Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
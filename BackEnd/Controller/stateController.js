const StateModel = require(
    "../Model/stateModel"
);

// create state
const createState = async (req, res) => {
    try {
        const { stateName } = req.body;
        console.log(">>>>>stateName", stateName);


        if (!stateName?.trim()) {
            return res.status(400).json({
                success: false,
                message:
                    "State name is required",
            });
        }

        const formattedState = stateName.trim().toLowerCase();
        console.log(">>>>>>formatedState", formattedState);


        const existingState = await StateModel.findOne({ stateName: formattedState, });

        if (existingState) {
            return res.status(400).json({
                success: false,
                message:
                    "State already exists",
            });
        }

        const result = await StateModel.create({ stateName: formattedState, });

        return res.status(201).json({
            success: true,
            message:
                "State created successfully",
            result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

//get all active states
// Active States ke liye
const getAllStates = async (req, res) => {
    try {
        const { search = "", sort = "asc", page = 1, limit = 10 } = req.query;

        // Base query for Active states with search filter
        const query = {
            status: "Active",
            ...(search && { stateName: { $regex: search, $options: "i" } })
        };

        const sortOrder = sort === "desc" ? -1 : 1;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const totalRecords = await StateModel.countDocuments(query);
        const result = await StateModel.find(query)
            .sort({ stateName: sortOrder })
            .skip(skip)
            .limit(parseInt(limit));

        return res.status(200).json({
            success: true,
            result,
            totalPages: Math.ceil(totalRecords / limit),
            currentPage: parseInt(page),
            totalRecords
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Inactive States ke liye
const getInactiveStates = async (req, res) => {
    try {
        const { search = "", sort = "asc", page = 1, limit = 10 } = req.query;

        // Base query for Inactive states with search filter
        const query = {
            status: "Inactive", // Agar aapka inactive status ka naam kuch aur hai (jaise 'Deactive' ya 'Block'), toh yahan change kar lena
            ...(search && { stateName: { $regex: search, $options: "i" } })
        };

        const sortOrder = sort === "desc" ? -1 : 1;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const totalRecords = await StateModel.countDocuments(query);
        const result = await StateModel.find(query)
            .sort({ stateName: sortOrder })
            .skip(skip)
            .limit(parseInt(limit));

        return res.status(200).json({
            success: true,
            result,
            totalPages: Math.ceil(totalRecords / limit),
            currentPage: parseInt(page),
            totalRecords
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

//get one
const getStateById = async (req, res) => {
    try {
        console.log(">>>>>>req.params", req.params.id);

        const result = await StateModel.findById(req.params.id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message:
                    "State not found",
            });
        }

        return res.status(200).json({
            success: true,
            result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

//permanent Delete
const deleteState = async (req, res) => {
    try {
        console.log(">>>>>>req.params.id", req.params.id);

        await StateModel.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message:
                "State deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message:
                error.message,
        });
    }
};

// update state
const updateState = async (req, res) => {
    try {
        const { stateName } = req.body;

        if (!stateName?.trim()) {
            return res.status(400).json({
                success: false,
                message: "State name is required",
            });
        }

        const formattedState = stateName.trim().toLowerCase();

        const existingState = await StateModel.findOne({
            stateName: formattedState,
            _id: { $ne: req.params.id },
        });

        if (existingState) {
            return res.status(400).json({
                success: false,
                message: "State already exists",
            });
        }

        const result = await StateModel.findByIdAndUpdate(
            req.params.id,
            {
                stateName: formattedState,
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "State updated successfully",
            result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const inactiveState = async (req, res) => {
    try {
        const result = await StateModel.findByIdAndUpdate(
            req.params.id,
            {
                status: "Inactive",
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "State moved to inactive successfully",
            result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const restoreState = async (req, res) => {
    try {
        const result = await StateModel.findByIdAndUpdate(
            req.params.id,
            {
                status: "Active",
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "State restored successfully",
            result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


module.exports = {
    createState,

    getAllStates,

    getInactiveStates,

    getStateById,

    deleteState,

    updateState,

    inactiveState,

    restoreState,
};
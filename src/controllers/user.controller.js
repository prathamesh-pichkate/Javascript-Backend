import asyncHandler from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
    res.status(404).json({
        message: "Hello get started with the "
    });
});

export { registerUser };

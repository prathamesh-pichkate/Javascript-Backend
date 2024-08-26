import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

// Middleware to verify the JWT token
export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        // Check if the token is present in cookies or the Authorization header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        // If no token is found, throw an unauthorized error
        if (!token) {
            throw new ApiError(401, "Unauthorized");
        }

        // Verify the token using the secret key
        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Find the user associated with the token and exclude sensitive fields
        const user = await User.findById(decodeToken?._id).select("-password -refreshToken");

        // If no user is found, throw an error indicating the token is invalid
        if (!user) {
            throw new ApiError(401, "Invalid access token");
        }

        // Attach the user to the request object for use in other middleware/routes
        req.user = user;
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        // Handle any errors, throwing an unauthorized error if something goes wrong
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});

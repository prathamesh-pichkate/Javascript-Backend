import asyncHandler from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"



const registerUser = asyncHandler(async (req, res) => {
    //Get the data from the user
    const {username,fullname,email,password} = req.body
        
    //check for empty field
    if (
        [username,fullname,email,password].some((field)=>
        field?.trim() === "")
    ) {
        throw new ApiError(400,"All fields are required.")
    }
    
    //check if user already exist
    const existedUser = User.findOne({
        $or:[{ username },{ email }]
    })

    if (existedUser) {
        throw new ApiError(409,"User with same email or username already exist.")
    }

    //upload avatar and coverImage and also check for avatar image
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar image is required")
    }

    //upload avatar and coverImage on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if(!avatar){
        throw new ApiError(400,"Avatar image is required")
    }
    
    //create user
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    })

    //check if the user is present by its id
    const createdUser = User.findById(user._id).select(
        "-password -refreshToken"
    )
    
    if (!createdUser) {
        throw new ApiError("Something when wrong while creating the User.")
    }
    
    //send the response
    return res.status(201).json(
        new ApiResponse(200,createdUser,"Successfully Registered the user")
    )
});




export { registerUser };

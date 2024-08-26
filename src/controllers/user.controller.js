import asyncHandler from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"


const generateAccessAndRefreshToken = async(userId)=>{
    try {
      const user = await User.findById(userId)
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

      //need to save the refreshtoken in mongoDB
      user.refreshToken = refreshToken
      await user.save({validateBeforeSave : false})

      return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"Something when wrong while accesing the token!")
    }
}

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
    const existedUser = await User.findOne({
        $or:[{ username },{ email }]
    })

    if (existedUser) {
        throw new ApiError(409,"User with same email or username already exist.")
    }

    //upload avatar and coverImage and also check for avatar image
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files?.coverImage?.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

   

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
    const createdUser = await User.findById(user._id).select(
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

const loginUser = asyncHandler(async (req,res) => {
    //get the data
    const {email,username,password} = req.body

    if(!username || !email){
        throw new ApiError(400,"Username or Email is required")
    }

    //verify username or email:
    const user = await User.findOne({
        $or: [ {username}, {email} ],
        })

    if(!user){ //user is the instance of the User.
        throw new ApiError(404,"User not found")
    }

    //User is the object of mongoose which we are not going to use to check the password
    // we will use the user which is verified upwords.
    const isPasswordValid = await user.comparePassword(password)

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid credentials")
    }
    
    //generate the refresh and access token
    const {refreshToken,accessToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = User.findById(user._id)
    .select("-password -refreshToken")


    //cookie can't modified from the frontend
    const options = {
        httpOnly,
        secure:true
    }

    return res
    .status(200)
    .cookie("refreshToken",refreshToken,options)
    .cookie("accessToken",accessToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "Login Successful"
        )
    )
})

const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            refreshToken: undefined,
        },
        {
            new:true,
        }
    )

    const options = {
        httpOnly,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged Out"))
})



export { 
    registerUser,
    loginUser,
    logoutUser
};

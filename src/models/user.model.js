import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },
    fullname:{
        type:String,
        required:true,  
        trim:true,
        index:true,
    },
    avatar:{
        type:String, //external link
        required:true,
    },
    coverImage:{
        type:String,
    },
    watchHistory: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video",
        }
    ],
    password:{
        type:String,
        required:[true,'Password is required']
    },
    refreshToken:{
        type:String,
    }
},{timestamps:true})

//pre hook to convert the passwrod into hash
userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        return next()
    }
    this.password = bcrypt.hash(this.password,10);
    next();
})


//methods to check if the password types by the user while login is correct
userSchema.methods.comparePassword = async function(candidatePassword){
    return await bcrypt.compare(candidatePassword,this.password);
}

//methods to generate the access token
userSchema.methods.generateAccessToken = async function(){
    return jwt.sign(
        {
            //Payload
            _id:this._id,
            email:this.email,
            fullname:this.fullname,
            username:this.username,

        },
        //secretKey
        process.env.ACCESS_TOKEN_SECRET,
        {
            //options
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

//methods to generate the refresh token
userSchema.methods.generateRefreshToken = async function(){
    return jwt.sign(
        {
            //Payload
            _id:this._id
        },
        //secretKey
        process.env.REFRESH_TOKEN_SECRET,
        {
            //options
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User",userSchema)
import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

//Configuration:
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

//upload an Image:
const uploadOnCloudinary = async(localFilePath) => {
    try {
       if(!localFilePath) return null
       //upload the file on cloudinary
       const uploadResponse = await cloudinary.uploader.upload(
        localFilePath, {
              resource_type:"auto"
       }
    );
      //File uploaded succesfully
    console.log("File is uploaded in cloudainary",uploadResponse.url);
    return uploadResponse;       
    } catch (error) {
       fs.unlinkSync(localFilePath)
       return null
    }
}

export {uploadOnCloudinary}
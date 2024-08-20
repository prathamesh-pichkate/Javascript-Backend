import dotenv from "dotenv"
import connectDB from "./db/index.js";
import {app} from "./app.js"
dotenv.config({
    path:"./env"
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000 , ()=>{
        console.log(`Server is running on port ${process.env.PORT || 8000}`)
    })
    app.on("error",()=>{
        console.log("error",error);
        throw error
    })
})
.catch((error)=>{
    console.log("MONGO db connection failed !!! ",error);
})






/*
import express from "express";
const app = express()
// Immediately Invoked Function Expression (IIFE)
;( async() => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",()=>{
            console.log("error",error);
            throw error
        })

        app.listen(process.env.PORT,()=>{
            console.log("Listening on port",process.env.PORT);
        })
    } catch (error) {
        console.error("ERROR:",error);
        throw err
    }
} )()
*/
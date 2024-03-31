import {app} from './app.js';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
dotenv.config({path:".env"});
import cloudinary from "cloudinary";


// Handling Uncaught Exception
process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Uncaught Exception`);
    process.exit(1);
  });

connectDB()


cloudinary.config({
    cloud_name: process.env.CLOUDINARY__NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

const server=app.listen(process.env.PORT,()=>{
        console.log(`Server is running on port http://localhost:${process.env.PORT}`);
})


// closing server on unhandel promise rejection 
process.on("unhandledRejection",(err)=>{
    console.log(`Error: ${err.message}`);
    console.log("Shutting down the server due to unhandeled promise rejection");
    server.close(()=>{
        process.exit(1);
    });
})

import mongoose from "mongoose";
import {DB_NAME} from './constant.js';
const {connect}=mongoose;
export const connectDB=()=>{
    connect(`${process.env.MONGODB_URL}/${DB_NAME}`).then(()=>{
        console.log("\nMONGODB connected !! ");
    })
}
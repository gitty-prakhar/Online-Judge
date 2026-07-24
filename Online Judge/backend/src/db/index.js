import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

// console.clear();
const connectDB= async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`MONGODB connected successfully and host is ${connectionInstance.connection.host}`);
        
    } catch (err) {
        console.log("MONGODB connection failed ",err);
        process.exit(1);
    }
}

export default connectDB;
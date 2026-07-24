import dotenv from "dotenv";
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({path:'./.env'});

connectDB()
.then(()=>{
    let port=8000||process.env.port;
    app.listen(port,()=>{
        console.log(`Server running at port ${port}\n`);
    })
})
.catch((err)=>{
    console.log(err);
});

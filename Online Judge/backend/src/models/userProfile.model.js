import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
    {
        user: {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
            unique:true
        },
        bio:{
            type:String,
            trim:true
        },
        github:{
            type:String,
            trim:true
        },
        linkedin:{
            type:String,
            trim:true
        },
        country:{
            type:String,
            trim:true
        },
        organization:{
            type:String,
            trim:true
        },
        avatar:{
            type:String
        },
        solvedProblems:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Problem"
            }
            
        ],
        attemptedProblems:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Problem"
            }
        ],
    },
    {
        timestamps:true
    }
);
//here solved problems and attempted problems is an array where each element of an array is an object
//which stores 2 things the id of problem and where to fetch that id from like from which model

export const Profile = mongoose.model("Profile",profileSchema);
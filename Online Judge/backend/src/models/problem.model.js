import mongoose from "mongoose";

const problemSchema = new mongoose.Schema(
    {
        title:{
            type:String,
            required:true,
            trim:true
        },
        slug:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true
        },

        //A slug is a URL-friendly version of a title
        //Without slug: https://onlinejudge.com/problems/6874ab89f3d9e8d...   This uses the MongoDB _id, which isn't very readable.
        //with slug https://onlinejudge.com/problems/two-sum    

        statement:{
            type:String,
            required:true
        },
        difficulty:{
            type:String,
            enum:["Easy","Medium","Hard"],
            required:true
        },
        tags:[
            {
                type:String,
                trim:true
            }
        ],
        constraints:{
            type:String
        },
        inputFormat:{
            type:String
        },
        outputFormat:{
            type:String
        },
        examples:[
            {
                input:{
                    type:String,
                    required:true
                },
                output:{
                    type:String,
                    required:true
                },
                explanation:{
                    type:String
                }
            }
        ],
        notes:{
            type:String
        },
        timeLimit:{
            type:Number,
            required:true
        },//milliseconds

        memoryLimit:{
            type:Number,
            required:true
        },//megabytes

        author:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        visibility:{
            type:String,
            enum:["Public","Private"],
            default:"Public"
        }
    },
    {
        timestamps: true
    }
);

export const Problem = mongoose.model("Problem", problemSchema);
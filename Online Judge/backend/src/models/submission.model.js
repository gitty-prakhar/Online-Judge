import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
    {
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        problemId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Problem",
            required:true
        },
        language:{
            type:String,
            enum:["C++","Java","Python","JavaScript"],
            required:true
        },
        code:{
            type:String,
            required:true
        },
        verdict:{
            type:String,
            enum:[
                "Pending",
                "Judging",
                "Accepted",
                "Wrong Answer",
                "Compilation Error",
                "Runtime Error",
                "Time Limit Exceeded",
                "Memory Limit Exceeded"
            ],
            default:"Pending"
        },

        executionTime:{
            type:Number
        },//milliseconds

        memoryUsed:{
            type:Number
        },//megabytes

        compileOutput:{
            type:String
        },

        runtimeError:{
            type:String
        }
    },
    {
        timestamps:true
    }
);

export const Submission = mongoose.model("Submission",submissionSchema);
import { Worker } from 'bullmq';
import { createRedisClient } from '../utils/createRedisClient.js';
import { Submission } from '../models/submission.model.js';
import { TestCase } from '../models/testCase.model.js';
import { executeCodeInDocker } from '../docker/executeCode.js';
import { Profile } from '../models/userProfile.model.js';
import connectDB from '../db/index.js';
import dotenv from 'dotenv';

dotenv.config({path:'./.env'}); //load from backend root

// Connect to MongoDB
connectDB()
.then(()=>{
    console.log("👷‍♂️ DB Connected. Judge Worker is ready.");
})
.catch(err=>{
    console.error("DB connection failed",err);
    process.exit(1);
});

//connect to Redis
const redisConnection=createRedisClient({maxRetriesPerRequest:null});

console.log("👷‍♂️ Judge Worker is running and listening to queue...");

//create the Worker
const judgeWorker=new Worker('judgeQueue',async(job)=>{
    const{submissionId}=job.data;
    console.log(`Processing submission:${submissionId}`);

    try{
        const submission=await Submission.findById(submissionId);
        if(!submission)throw new Error("Submission not found");

        submission.verdict="Judging";
        await submission.save();

        const testCases=await TestCase.find({problemId:submission.problemId});
        
        let finalVerdict="Accepted";

        for(let i=0;i<testCases.length;i++){
            const tc=testCases[i];
            
            const result=await executeCodeInDocker(submission.language,submission.code,tc.input);

            if(result.verdict!=="Success"){
                finalVerdict=result.verdict;//TLE or Runtime Error
                break;
            }

            if(result.output!==tc.expectedOutput.trim()){
                finalVerdict="Wrong Answer";
                break;
            }
        }

        submission.verdict=finalVerdict;
        await Profile.findOneAndUpdate(
            {user:submission.userId},
            {$addToSet:{attemptedProblems:submission.problemId}},
            {upsert:true}
        );
        await submission.save();
        
        await redisConnection.publish('submission-updates',JSON.stringify({submissionId,verdict:finalVerdict}));

        if(finalVerdict==="Accepted"){
            await Profile.findOneAndUpdate(
                {user:submission.userId},
                {$addToSet:{solvedProblems:submission.problemId}},
                {upsert:true}
            );
            await redisConnection.del("global_leaderboard");
        }
        
        console.log(`Finished processing ${submissionId}. Verdict: ${finalVerdict}`);

    } 
    catch(error){
        console.error(`Error processing job ${job.id}:`,error);
        
        await Submission.findByIdAndUpdate(submissionId,{verdict:"INTERNAL_ERROR"});
    }
}, {connection:redisConnection});

//email worker
import { sendEmail } from '../utils/sendEmail.js';

console.log("📧 Email Worker is running and listening to queue...");

const emailWorker=new Worker('emailQueue',async(job)=>{
    const{email,subject,message}=job.data;
    console.log(`Processing email job for: ${email}`);

    try{
        await sendEmail({email,subject,message});
        console.log(`Email successfully sent to ${email}`);
    } 
    catch(error){
        console.error(`Failed to send email to ${email}:`,error);
        throw error;
    }
}, {connection:redisConnection});

import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { Submission } from '../models/submission.model.js';
import { TestCase } from '../models/testCase.model.js';
import { executeCodeInDocker } from '../docker/executeCode.js';
import { Profile } from '../models/userProfile.model.js';

// Connect to Redis
const redisConnection = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    maxRetriesPerRequest: null
});

console.log("👷‍♂️ Judge Worker is running and listening to queue...");

// Create the Worker
const judgeWorker = new Worker('judgeQueue', async (job) => {
    const { submissionId } = job.data;
    console.log(`Processing submission: ${submissionId}`);

    try {
        // 1. Fetch submission and update status to "Judging"
        const submission = await Submission.findById(submissionId);
        if (!submission) throw new Error("Submission not found");

        submission.verdict = "Judging";
        await submission.save();

        // 2. Fetch all test cases for this problem
        const testCases = await TestCase.find({ problemId: submission.problemId });
        
        let finalVerdict = "Accepted";

        // 3. Loop through all test cases and run the code
        for (let i = 0; i < testCases.length; i++) {
            const tc = testCases[i];
            
            // Send to Docker Sandbox
            const result = await executeCodeInDocker(submission.language, submission.code, tc.input);

            if (result.verdict !== "Success") {
                finalVerdict = result.verdict; // TLE or Runtime Error
                break;
            }

            // Compare outputs (trimming whitespace is important!)
            if (result.output !== tc.expectedOutput.trim()) {
                finalVerdict = "Wrong Answer";
                break;
            }
        }

        // 4. Update the final result in DB
        submission.verdict = finalVerdict;
        await submission.save();
        
        // 5. Track solved problems for the Leaderboard
        if (finalVerdict === "Accepted") {
            await Profile.findOneAndUpdate(
                { user: submission.userId },
                { $addToSet: { solvedProblems: submission.problemId } }, // $addToSet prevents duplicates
                { upsert: true }
            );
            // Invalidate Redis Leaderboard cache so it updates
            await redisConnection.del("global_leaderboard");
        }
        
        console.log(`Finished processing ${submissionId}. Verdict: ${finalVerdict}`);

    } catch (error) {
        console.error(`Error processing job ${job.id}:`, error);
        
        // Mark as internal error if the worker crashes
        await Submission.findByIdAndUpdate(submissionId, { verdict: "INTERNAL_ERROR" });
    }
}, { connection: redisConnection });

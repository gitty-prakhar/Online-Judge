import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { Submission } from "../models/submission.model.js";
import { Problem } from "../models/problem.model.js";
import { judgeQueue } from "../queues/judgeQueue.js";
import Redis from "ioredis";

// Dedicated redis client for subscribing to SSE events
const redisSubscriber=new Redis({
    host:process.env.REDIS_HOST||'127.0.0.1',
    port:process.env.REDIS_PORT||6379,
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 3,
});
redisSubscriber.on('error', (err) => console.error('[Redis SSE] connection error:', err.message));
redisSubscriber.connect().then(() => {
    redisSubscriber.subscribe("submission-updates");
}).catch(err => console.error('[Redis SSE] failed to connect:', err.message));


// 1. Submit Code
const createSubmission = asyncHandler(async(req,res)=>{
    const {problemId,language,code}=req.body;

    if (!problemId || !language || !code) {
        throw new ApiError(400,"Problem ID, language, and code are required");
    }

    // Check if problem exists
    const problem=await Problem.findById(problemId);
    if(!problem){
        throw new ApiError(404,"Problem not found");
    }

    // Create a pending submission in MongoDB
    const submission=await Submission.create({
        userId:req.user._id,
        problemId,
        language,
        code,
        verdict:"Pending"
    });

    // Push the submission ID to the BullMQ Queue for background processing
    await judgeQueue.add('judge-code',{submissionId: submission._id});

    // Immediately return the submission ID so the frontend can start polling
    return res.status(201).json(
        new APIResponse(201,submission,"Submission received and queued")
    );
});

// 2. Get specific submission status (For the frontend to poll)
const getSubmissionById=asyncHandler(async(req,res)=>{
    const {id}=req.params;

    const submission=await Submission.findById(id)
        .populate("problemId","title")
        .populate("userId","username");

    if(!submission){
        throw new ApiError(404,"Submission not found");
    }

    return res.status(200).json(
        new APIResponse(200,submission,"Submission fetched successfully")
    );
});

// 3. SSE Endpoint for Real-Time Updates
const streamSubmissionUpdates=(req,res)=>{
    // Setup SSE headers
    res.setHeader('Content-Type','text/event-stream');
    res.setHeader('Cache-Control','no-cache');
    res.setHeader('Connection','keep-alive');
    res.flushHeaders(); // flush the headers to establish SSE connection

    // Send an initial connected event
    res.write(`data: ${JSON.stringify({ message: "Connected to Real-Time Updates" })}\n\n`);

    // Listen to Redis messages
    const messageHandler = (channel, message) => {
        if (channel === 'submission-updates') {
            // Forward the message to the client
            res.write(`data: ${message}\n\n`);
        }
    };

    redisSubscriber.on('message', messageHandler);

    // Clean up when the client disconnects
    req.on('close', () => {
        redisSubscriber.removeListener('message', messageHandler);
        res.end();
    });
};

export {createSubmission,getSubmissionById,streamSubmissionUpdates};

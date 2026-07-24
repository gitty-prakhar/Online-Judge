import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { Submission } from "../models/submission.model.js";
import { Problem } from "../models/problem.model.js";
import { judgeQueue } from "../queues/judgeQueue.js";

// 1. Submit Code
const createSubmission = asyncHandler(async(req,res) => {
    const { problemId, language, code } = req.body;

    if (!problemId || !language || !code) {
        throw new ApiError(400, "Problem ID, language, and code are required");
    }

    // Check if problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
        throw new ApiError(404, "Problem not found");
    }

    // Create a pending submission in MongoDB
    const submission = await Submission.create({
        userId: req.user._id,
        problemId,
        language,
        code,
        verdict: "Pending"
    });

    // Push the submission ID to the BullMQ Queue for background processing
    await judgeQueue.add('judge-code', { 
        submissionId: submission._id 
    });

    // Immediately return the submission ID so the frontend can start polling
    return res.status(201).json(
        new APIResponse(201, submission, "Submission received and queued")
    );
});

// 2. Get specific submission status (For the frontend to poll)
const getSubmissionById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const submission = await Submission.findById(id)
        .populate("problemId", "title")
        .populate("userId", "username");

    if (!submission) {
        throw new ApiError(404, "Submission not found");
    }

    return res.status(200).json(
        new APIResponse(200, submission, "Submission fetched successfully")
    );
});

export { createSubmission, getSubmissionById };

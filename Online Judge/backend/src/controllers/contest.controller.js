import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { Contest } from "../models/contest.model.js";

const createContest = asyncHandler(async (req, res) => {
    const { title, startTime, endTime, problems } = req.body;
    if (!title || !startTime || !endTime) throw new ApiError(400, "Missing required fields");
    const contest = await Contest.create({ title, startTime, endTime, problems });
    return res.status(201).json(new APIResponse(201, contest, "Contest created"));
});

const getAllContests = asyncHandler(async (req, res) => {
    const contests = await Contest.find().sort({ startTime: -1 }).select("-problems");
    return res.status(200).json(new APIResponse(200, contests, "Contests fetched"));
});

const getContestById = asyncHandler(async (req, res) => {
    const contest = await Contest.findById(req.params.id).populate("problems.problemId", "title difficulty");
    if (!contest) throw new ApiError(404, "Contest not found");
    return res.status(200).json(new APIResponse(200, contest, "Contest fetched"));
});

const registerForContest = asyncHandler(async (req, res) => {
    const contest = await Contest.findById(req.params.id);
    if (!contest) throw new ApiError(404, "Contest not found");
    const isRegistered = contest.participants.some(p => p.userId.toString() === req.user._id.toString());
    if (isRegistered) throw new ApiError(400, "Already registered");
    
    contest.participants.push({ userId: req.user._id, score: 0 });
    await contest.save();
    return res.status(200).json(new APIResponse(200, {}, "Registered successfully"));
});

export { createContest, getAllContests, getContestById, registerForContest };

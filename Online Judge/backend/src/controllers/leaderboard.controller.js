import { asyncHandler } from "../utils/asyncHandler.js";
import { APIResponse } from "../utils/apiResponse.js";
import { Profile } from "../models/userProfile.model.js";
import { createRedisClient } from "../utils/createRedisClient.js";

const redis = createRedisClient();
redis.on('error', (err) => console.error('[Redis Leaderboard] connection error:', err.message));


const getGlobalLeaderboard = asyncHandler(async (req, res) => {
    const cachedLeaderboard = await redis.get("global_leaderboard");
    if (cachedLeaderboard) {
        return res.status(200).json(new APIResponse(200, JSON.parse(cachedLeaderboard), "Leaderboard (Cached)"));
    }

    const leaderboard = await Profile.aggregate([
        { $project: { user: 1, avatar: 1, solvedCount: { $size: { $ifNull: ["$solvedProblems", []] } } } },
        { $sort: { solvedCount: -1 } },
        { $limit: 100 },
        { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "userDetails" } },
        { $unwind: "$userDetails" },
        { $project: { _id: 0, username: "$userDetails.username", avatar: 1, solvedCount: 1 } }
    ]);

    await redis.set("global_leaderboard", JSON.stringify(leaderboard), "EX", 300); // 5 mins cache
    return res.status(200).json(new APIResponse(200, leaderboard, "Leaderboard fetched"));
});
export { getGlobalLeaderboard };

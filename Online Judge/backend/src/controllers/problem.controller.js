import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { Problem } from "../models/problem.model.js";
import { createRedisClient } from "../utils/createRedisClient.js";

const redis = createRedisClient();

const generateSlug=(title)=>{
    return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

const createProblem=asyncHandler(async(req,res)=>{
    const{
        title,statement,difficulty,tags,
        constraints,inputFormat,
        outputFormat,examples,notes,timeLimit,
        memoryLimit,visibility
    }=req.body;
    
    if(!title || !statement || !difficulty || !timeLimit || !memoryLimit){
        throw new ApiError(400,"Title, statement, difficulty, timeLimit, and memoryLimit are required");
    }
    
    const slug=generateSlug(title);

    const existingProblem=await Problem.findOne({slug});

    if(existingProblem){
        throw new ApiError(400,"A similar problem with same title already exists choose different title\n");
    }

    const problem=await Problem.create({
        title,slug,statement,difficulty,tags:tags||[],constraints,inputFormat,outputFormat,examples:examples||[],
        notes,timeLimit,memoryLimit,author:req.user._id,visibility:visibility||"Public"
    });

    if(!problem){
        throw new ApiError(500,"Something went wrong while creating the problem");
    }

    return res.status(200).json(
        new APIResponse(201,problem,"Problem created successfully\n")
    );
})


const getAllProblems=asyncHandler(async(req,res)=>{
    const page=parseInt(req.query.page)||1;
    const limit=parseInt(req.query.limit)||10;
    const skip=(page-1)*limit;
    const {search,difficulty,tags}=req.query;

    const cacheKey = `problems_page_${page}_limit_${limit}_search_${search||''}_diff_${difficulty||''}_tags_${tags||''}`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
        return res.status(200).json(new APIResponse(200, JSON.parse(cachedData), "Problems fetched (Cached)"));
    }

    let filter = {visibility: "Public"};

    if(search){
        filter.title={$regex:search,$options:"i"};
    }
    if(difficulty){
        filter.difficulty = difficulty;
    }
    if (tags) {
        filter.tags = { $in: [tags] }; 
    }

    const problems = await Problem.find(filter)
        .select("title slug difficulty tags timeLimit memoryLimit")
        .populate("author", "username")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const totalProblems = await Problem.countDocuments(filter);
    const totalPages = Math.ceil(totalProblems / limit);

    const responseData = {
        problems,
        pagination: {
            totalProblems,
            totalPages,
            currentPage: page,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    };

    await redis.set(cacheKey, JSON.stringify(responseData), 'EX', 300); // 5 mins cache

    return res.status(200).json(
        new APIResponse(200, responseData, "Problems fetched successfully")
    );
});

const getProblemBySlug=asyncHandler(async(req,res)=>{
    const {slug}=req.params;

    const cachedData = await redis.get(`problem_${slug}`);
    if (cachedData) {
        return res.status(200).json(new APIResponse(200, JSON.parse(cachedData), "Problem fetched (Cached)"));
    }

    const problem=await Problem.findOne({slug}).populate("author","username");

    if(!problem){
        throw new ApiError(404,"Problem not found");
    }

    await redis.set(`problem_${slug}`, JSON.stringify(problem), 'EX', 300); // 5 mins cache

    return res.status(200).json(new APIResponse(200,problem,"Problem fetched successfully"));
});

const updateProblem=asyncHandler(async(req,res)=>{
    const {id}=req.params;

    const problem=await Problem.findById(id);

    if(!problem){
        throw new ApiError(404,"Problem not found");
    }

    // if(problem.author.toString()!==req.user._id.toString() && req.user.role !== "admin"){
    //     throw new ApiError(403,"You do not have permission to edit this problem");
    // }

    // I have managed the admin access in the middleware in verifyAdmin


    let updatedData={...req.body};
    if (req.body.title){
        updatedData.slug=generateSlug(req.body.title);
    }
    const updatedProblem = await Problem.findByIdAndUpdate(
        id,
        { $set: updatedData },
        { new: true, runValidators: true }
    );
    
    if (updatedProblem) {
        await redis.del(`problem_${updatedProblem.slug}`);
    }

    return res.status(200).json(new APIResponse(200,updatedProblem,"Problem updated successfully"));
})

const deleteProblem=asyncHandler(async(req,res)=>{
    const {id}=req.params;
    const problem=await Problem.findById(id);
    if(!problem){
        throw new ApiError(404,"Problem not found");
    }
    
    // if (problem.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    //     throw new ApiError(403, "You do not have permission to delete this problem");
    // }
    // I have managed the admin access in the middleware in verifyAdmin

    await Problem.findByIdAndDelete(id);
    await redis.del(`problem_${problem.slug}`);
    
    return res.status(200).json(new APIResponse(200,{},"Problem deleted successfully"));
});


export {createProblem,getAllProblems,getProblemBySlug,updateProblem,deleteProblem};

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { Problem } from "../models/problem.model.js";

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

    const problems=await Problem.find({visibility:"Public"})
    .select("title slug difficulty tags timeLimit memoryLimit")
    .populate("author","username").sort({createdAt:-1})

    return res.status(200).json(new APIResponse(200, problems, "Problems fetched successfully"));
});

const getProblemBySlug=asyncHandler(async(req,res)=>{
    const {slug}=req.params;

    const problem=await Problem.findOne({slug}).populate("author","username");

    if(!problem){
        throw new ApiError(404,"Problem not found");
    }

    return res.status(200).json(new APIResponse(200,problem,"Problem fetched successfully"));
});

const updateProblem=asyncHandler(async(req,res)=>{
    const {id}=req.params;

    const problem=await Problem.findById(id);

    if(!problem){
        throw new ApiError(404,"Problem not found");
    }

    if(problem.author.toString()!==req.user._id.toString() && req.user.role !== "admin"){
        throw new ApiError(403,"You do not have permission to edit this problem");
    }

    let updatedData={...req.body};
    if (req.body.title){
        updatedData.slug=generateSlug(req.body.title);
    }
    const updatedProblem = await Problem.findByIdAndUpdate(
        id,
        { $set: updatedData },
        { new: true, runValidators: true }
    );
    return res.status(200).json(
        new APIResponse(200, updatedProblem, "Problem updated successfully")
    );
})

const deleteProblem = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const problem = await Problem.findById(id);
    if (!problem) {
        throw new ApiError(404, "Problem not found");
    }
    // Optional: Only allow author or admin to delete
    if (problem.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
        throw new ApiError(403, "You do not have permission to delete this problem");
    }
    await Problem.findByIdAndDelete(id);
    return res.status(200).json(
        new APIResponse(200, {}, "Problem deleted successfully")
    );
});


export { 
    createProblem, 
    getAllProblems, 
    getProblemBySlug, 
    updateProblem, 
    deleteProblem 
};

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { Profile } from "../models/userProfile.model.js";
import { User } from "../models/user.model.js";

const getUserProfile=asyncHandler(async(req,res)=>{
    const {username}=req.params;

    const user=await User.findOne({username});
    if(!user){
        throw new ApiError(404,"User not found");
    }

    let profile=await Profile.findOne({user:user._id})
        .populate("solvedProblems","title slug difficulty")
        .populate("attemptedProblems","title slug difficulty");

    if(!profile){
        profile = await Profile.create({user:user._id});
    }

    const profileData={
        username:user.username,
        email:user.email,
        role:user.role,
        ...profile.toObject() 
    };

    return res.status(200).json(new APIResponse(200, profileData,"Profile fetched successfully"));
});

const updateProfile=asyncHandler(async(req,res)=>{
    const {bio,github,linkedin,country,organization,avatar}=req.body;

    let profile=await Profile.findOne({user:req.user._id});
    
    if(!profile){
        profile=await Profile.create({user:req.user._id});
    }

    profile=await Profile.findByIdAndUpdate(profile._id,
        {
            $set:{
                ...(bio && {bio}),
                ...(github && {github}),
                ...(linkedin && {linkedin}),
                ...(country &&{country}),
                ...(organization && {organization}),
                ...(avatar && {avatar}),
            }
        },

        {
            new:true,runValidators:true
        }
    );
    return res.status(200).json(new APIResponse(200,profile,"Profile updated successfully"));
});

export {getUserProfile,updateProfile};

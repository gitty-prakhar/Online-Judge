import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { APIResponse } from "../utils/apiResponse.js";
import { sendEmail } from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens=async(userId)=>{
    try{
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false});
        return {accessToken,refreshToken};
    }
    catch(error){
        throw new ApiError(500,"Something went wrong while generating refresh and access token")
    }
}

const registerUser=asyncHandler(async (req,res)=>{
        const {email,username,password}=req.body;
        if(!email || !username || !password){
            throw new ApiError(400,"All fields are required\n");
        }

        const existedUser = await User.findOne({
            $or:[{username},{email}]
        });

        if(existedUser){
            throw new ApiError(400,"User already exists\n");
        }
        
        const user = await User.create({
            email,
            password,
            username:username.toLowerCase()
        })

        const createdUser=await User.findById(user._id).select("-password -refreshToken");

        if(!createdUser){
            throw new ApiError(500,"Something went wrong while creating the user\n");
        }

        return res.status(201).json(
            new APIResponse(200,createdUser,"User created successfully")
        );
})


const loginUser=asyncHandler(async (req,res)=>{
    const {username,email,password}= req.body;
    if(!email && !username){
        throw new ApiError(400,"Username or email is required");
    }

    const user = await User.findOne({
        $or:[{email},{username}]
    }).select("+password");

    if(!user){
        throw new ApiError(404,"User does not exist");
    }
    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if(!isPasswordCorrect){
        throw new ApiError(401,"Invalid user credentials");
    }

    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id);

    const loggedInUser= await User.findById(user._id).select("-password -refreshToken");

    const options={
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new APIResp=onse(200,
            {
                user:loggedInUser,
                accessToken,
                refreshToken
            },
            "User logged in successfully"
        )
    );

})

const logoutUser=asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )

    const options={
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new APIResponse(200,{},"User Logged out\n"));
})

const refreshAccessToken=asyncHandler(async (req,res)=>{
    const incomingToken=req.cookies.refreshToken || req.body.refreshToken;
    
    if(!incomingToken){
        throw new ApiError(401,"Unauthorised Request\n");
    }
    try {
        const decodedToken=jwt.verify(incomingToken,process.env.REFRESH_TOKEN_SECRET);
    
        const user=await User.findById(decodedToken?._id);
    
        if(!user){
            throw new ApiError(401,"Invalid refresh token\n");
        }
    
        if(incomingToken !== user?.refreshToken){
            throw new ApiError(401,"Refesh token is expired");
        }

        const options={
            httpOnly:true,
            secure:true
        }
    
        const {accessToken,refreshToken:newRefreshToken}=await generateAccessAndRefreshTokens(user._id);
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new APIResponse(200,{accessToken,refreshToken:newRefreshToken},"Access Token refreshed")
        );
    } catch (error) {
        throw new ApiError(401,error.message || "Invalid Refresh Token");
    }
})

const getCurrentUser=asyncHandler(async(req,res)=>{
    return res.status(200).json(
        new APIResponse(
            200, 
            req.user, 
            "Current user fetched successfully"
        )
    );
});

const changeCurrentPassword=asyncHandler(async(req,res)=>{

    const {oldPassword,newPassword}=req.body;
    if (!oldPassword||!newPassword){
        throw new ApiError(400, "Both old and new password are required");
    }

    const user=await User.findById(req.user?._id).select("+password");

    const isPasswordValid = await user.isPasswordCorrect(oldPassword);
    if(!isPasswordValid) {
        throw new ApiError(400, "Invalid old password");
    }

    user.password=newPassword;

    await user.save({
        validateBeforeSave:false
    })

    return res.status(200).json(new APIResponse(200,{},"Password changed successfully"));

})

const forgotPassword=asyncHandler(async (req,res)=>{
    const {email}=req.body;
    if(!email){
        throw new ApiError(400,"Email not found");
    }
    const user = await User.findOne({email});

    if(!user){
        throw new ApiError(404,"User not found");
    }

    const otp=Math.floor(100000+Math.random()*900000).toString();

    user.forgotPasswordOtp=otp;
    user.forgotPasswordOtpExpiry=Date.now()+15*60*1000;

    await user.save({validateBeforeSave:false});

    const message=`Your password reset OTP is: ${otp}.It is valid for 15 minutes.`;
    
    try{
        await sendEmail({
            email:user.email,
            subject:"Password Reset OTP",
            message:message
        });
        return res.status(200).json(new APIResponse(200,{},"OTP sent to email"));
    } 
    catch(error){
        user.forgotPasswordOtp = undefined;
        user.forgotPasswordOtpExpiry = undefined;
        await user.save({validateBeforeSave:false});
        throw new ApiError(500,"Failed to send email. Please try again.");
    }

})

const resetPassword=asyncHandler(async(req,res)=>{
    const {email,otp,newPassword}=req.body;

    if(!email || !otp || !newPassword){
        throw new ApiError(400,"Invalid credentials");
    }

    const user=await User.findOne({email,forgotPasswordOtp:otp});

    if(!user){
        throw new ApiError(400,"Invalid OTP or email")
    }

    if(user.forgotPasswordOtpExpiry<Date.now()){
        throw new ApiError(400,"OTP has expired");
    }

    user.password=newPassword;
    user.forgotPasswordOtp=undefined;
    user.forgotPasswordOtpExpiry=undefined;

    await user.save({validateBeforeSave:false});

    return res.status(200).json(new APIResponse(200,{},"Password reset successfully"));


})

export {registerUser,loginUser,logoutUser,refreshAccessToken,getCurrentUser,changeCurrentPassword,forgotPassword,resetPassword};
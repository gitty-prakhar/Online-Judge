const asyncHandler = (requestHander)=>{
    return async(req,res,next)=>{
        try{
            await requestHander(req,res,next);
        } 
        catch(err){
            next(err);
        }
    }
}

export {asyncHandler};
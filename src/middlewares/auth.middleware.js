
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken"
import {User} from "../models/user.model.js"

export const verifyjwt=asyncHandler(async(req,_,next)=>{

   try {
     const token=req.cookies?.accesstoken || req.header("authoriztion")?.replace("Bearer","")
 
     if(!token){
         throw new ApiError(401,"unautorized request")
     }
 
      const decodedtoken= jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
 
      const user =await User.findById(decodedtoken?._id).select("-password -refreshtoken")
 
         if(!user){
             throw new ApiError(400,"error in access token")
         }
 req.user=user;
 next();
   } catch (error) {
    throw new ApiError(401,"problem in genrating token")
    
   }
})
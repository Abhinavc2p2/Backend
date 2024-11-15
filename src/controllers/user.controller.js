import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudnairy.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import jwt from "jsonwebtoken"

const genrateaccesstokenandrefreshtoken = async (userId) => {
  try {
      const user = await User.findById(userId);
      console.log("Found user:", user);
      if (!user) {
          throw new ApiError(404, "User not found");
      }

      const accesstoken = user.generateAccessToken();  // Now this will return the token
      console.log("Generated access token:", accesstoken);

      const refreshtoken = user.generateRefreshToken();  // Now this will return the token
      console.log("Generated refresh token:", refreshtoken);

      user.refreshtoken = refreshtoken;
      await user.save({ validateBeforeSave: false });

      return { accesstoken, refreshtoken };
  } catch (error) {
      console.error("Error in generating tokens:", error);
      throw new ApiError(500, "Something went wrong while generating access token and refresh token");
  }
};

const registeruser = asyncHandler(async (req, res) => {
  const { fullname, username, email, password } = req.body;

  // Validate that all required fields are present
  if ([fullname, email, username, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if user already exists
  const existeduser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existeduser) {
    throw new ApiError(409, "User is already in the database");
  }

  // Validate avatar and cover image upload
  const avatarFiles = req.files?.avtar;
  const coverImageFiles = req.files?.coverimgage;

  if (!avatarFiles || !avatarFiles[0]?.path) {
    throw new ApiError(400, "Avatar file is required");
  }
  const avtarlocalpath = avatarFiles[0].path;

  // const localpathcoverimge = coverImageFiles?.[0]?.path || ""; // Optional cover image

  let localpathcoverimge;
  if(req.files && Array.isArray(req.files.coverimage)&&req.files.coverimage.length>0){
    localpathcoverimge=req.files.coverimage[0].path
  }

  // Upload to Cloudinary
  const avtar = await uploadCloudinary(avtarlocalpath);
  const coverimage = await uploadCloudinary(localpathcoverimge);

  if (!avtar) {
    throw new ApiError(400, "Avatar upload failed");
  }

  // Create user
  const user = await User.create({
    fullname,
    avtar: avtar.url,
    coverimage: coverimage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  console.log(user);

  const usercreatd = await User.findById(user._id).select("-password -refreshToken");
  if (!usercreatd) {
    throw new ApiError(500, "Something went wrong");
  }

  return res.status(201).json(new Apiresponse(200, usercreatd, "Successfully created user"));
});

const loginuser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  console.log(email);

  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(400, "user not exist");
  }
  const isPasswordValid = await user.isPasswordcorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "password is incorrect");
  }

  const { refreshtoken, accesstoken } = await genrateaccesstokenandrefreshtoken(user._id);

  // Use lean to get a plain JavaScript object
  const loggedInUser = await User.findById(user._id).lean().select("-password -refreshtoken");

  const options = {
    httponly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accesstoken", accesstoken, options)
    .cookie("refreshtoken", refreshtoken, options)
    .json(
      new Apiresponse(
        200,
        {
          user: loggedInUser,
          accesstoken,
          refreshtoken,
        },
        "user logged in successfully"
      )
    );
});

const logoutuser=asyncHandler(async(req,res)=>{
 await  User.findByIdAndUpdate(req.user._id,{
    $set:{refreshtoken:undefined}
   },{
    new:true
   })
   const options={
    httponly:true,
    secure:true,
  }
  return res.status(200).clearCookie("accesstoken",options).clearCookie("refreshtoken",options).json(
    new Apiresponse(200,{},"user logged out")
  )

})

const refreshaccesstokenn=asyncHandler(async(req,res)=>{
   const incomingrefreshtoken=  req.cookies.refreshtoken ||req.body.refreshtoken

   if(!incomingrefreshtoken){
    throw new ApiError(401,"unautorized request")
   }

   try {
    const decodedtoken =jwt.verify(incomingrefreshtoken,process.env.REFRESH_TOKEN_SECRET)
 
    const user=User.findById(decodedtoken?._id)
 
    if(!user){
     throw new ApiError(401,"Invalid refresh token")
    }
 if(incomingrefreshtoken!==user?.refreshToken){
   throw new ApiError(401,"Invalid user expired refresh token")
 }
 
 
 const options={
   httponly:true,
   secure:true
 }
 
  const {nrefreshtoken,accesstoken}=await genrateaccesstokenandrefreshtoken(user._id)
 
  return res.status(200).cookie("accesstoken",accesstoken,options).cookie("refreshtoken",nrefreshtoken,options)
 .json(
   new Apiresponse(
     200,{accesstoken,refreshToken:nrefreshtoken},"ccestoken refreshtoken refreshed"
   )
 )
  
   } catch (error) {
    throw new ApiError(401,"invlaid refresh token")
    
   }

})


export { registeruser,
  loginuser,logoutuser,refreshaccesstokenn
};

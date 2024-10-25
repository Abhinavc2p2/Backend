import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudnairy.js";
import { Apiresponse } from "../utils/Apiresponse.js";

const genrateaccesstokenandrefreshtoken=async(userId)=>{
  try {
  const user=  await user.findById(userId)
  const accesstoken=  user.genrateaccesstoken()
  const refreshtoken=  user.genraterefreshtoken()

  user.refreshtoken=refreshtoken
 await user.save({validateBeforeSave:false})

 return{accesstoken,refreshtoken}

  } catch (error) {
    throw new ApiError(500,"something went worong while genrting access token and refresh token")
    
  }

}
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

const loginuser=asyncHandler(async(req,res)=>{
  //cookies
  //data le aoo
  //refreshtoken
  //accesstoken
  //userfind db
  //redirect new ya home page

  const {email,username,password}=req.body

  if(!username || email){
    throw new ApiError(400,"username or password is required")
  }

  const user= await User.findOne({
    $or:[{username},{email}]
  })

  if(!user){
    throw new ApiError(400,"user not exist")
  }
   const ispasswordvalid=await user.isPasswordcorrect(password)

   if(!ispasswordvalid){
    throw new ApiError(401,"passowrd is incorrect")
  }
  const {refreshtoken,accesstoken}=await genrateaccesstokenandrefreshtoken(user._id)

  const loggedinuser= User.findById(user._id).select("-password -refreshtoken")

  const options={
    httponly:true,
    secure:true,
  }

  return res.status(200).cookie("accesstoken",accesstoken,options).cookie("refreshtooken",refreshtoken,options).json(
    new Apiresponse(
      200,
      {
        user:loggedinuser,accesstoken,refreshtoken
      },
      "userlogged in sucessfuly"
    )
  )

  

})
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
export { registeruser,
  loginuser,logoutuser
};

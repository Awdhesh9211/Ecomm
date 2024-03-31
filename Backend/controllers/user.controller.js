import User from '../models/user.model.js'
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from '../middleware/asyncHandler.js';
import sendToken from "../utils/jwtToken.js";
import sendEmail from '../utils/sendEmail.js';
import crypto from "crypto";
import cloudinary from "cloudinary";

//---------------------------------------REGISTRATION 
const registerUser=asyncHandler(async(req,res,next)=>{
  console.log("f->registerUser");

  const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
    folder: "avatars",
    width: 150,
    crop: "scale",
  });

  const { name, email, password } = req.body;

  const exist=await user.findOne({email});

  if(exist) return next(new ApiError("User Already Exist ",400));


  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id:myCloud.public_id,
      url: myCloud.secure_url,
    },
  });

  sendToken(user,201,res);

})

//--------------------------------------------LOGIN
const loginUser=asyncHandler(async(req,res,next)=>{
  console.log("f->loginUser");
  
  const {email,password}=req.body;

  if(!email || !password) return next(new ApiError("Please Enter Email & Password",400));

  const user=await User.findOne({email}).select("+password");
  if(!user) return next(new ApiError("Invalid Email or Password",401));
  
  const isMatched=await user.comparePassword(password);
  if(!isMatched) return next(new ApiError("Invalid Email or Password",401));

  sendToken(user,200,res);

})

//-------------------------------------------LOGOUT
const logoutUser=asyncHandler(async(req,res,next)=>{
  console.log("f->logoutUser");

  res.cookie("token",null, { expires: new Date(Date.now()),httpOnly: true,})
  .status(200).json({success:true,message:"Logged Out Successfully"})
})

//--------------------------------------------FORGOT PASSWORD
const forgotPassword = asyncHandler(async (req, res, next) => {
  console.log("f->forgotPassword"); 

  const user = await User.findOne({ email: req.body.email });

  if (!user) return next(new ApiError("User not found", 404));

  // Get ResetPassword Token
  const resetToken =await user.getResetToken();
  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;

  const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;
  
  try {
    await sendEmail({email: user.email,subject: `Ecomm Password Recovery`,message,});
    
    res.status(200).json({success: true,message: `Email sent to ${user.email} successfully`,});

  } catch (error) {

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new ApiError(error.message, 500));
  }

  res.status(200).json({
    success:true,
    resetPasswordUrl,
    message
  })

});


//-------------------------------------------REST PASSWORD
const resetPassword = asyncHandler(async (req, res, next) => {
  console.log("f->resetPassword");

  // creating token hash
  const resetPasswordToken = crypto.createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) return next( new ApiError("Reset Password Token is invalid or has been expired",400));

  if (req.body.password !== req.body.confirmPassword) return next(new ApiError("Password does not match", 400));
  
  user.password = req.body.password;

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendToken(user, 200, res);

});

//--------------------------------------USER DETAILS
const getUserDetails = asyncHandler(async (req, res, next) => {
   console.log("f->getUserDetails");

  const user = await User.findById(req.user?.id);
  res.status(200).json({success: true,user,});

});

//-----------------------------------------UPDATE PASSWORD
const updatePassword = asyncHandler(async (req, res, next) => {
  console.log("f->updatePassword");

  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) return next(new ApiError("Old password is incorrect", 400));
  
  if (req.body.newPassword !== req.body.confirmPassword) return next(new ApiError("password does not match", 400));

  user.password = req.body.newPassword;
  await user.save();

  sendToken(user, 200, res);

});


//------------------------------------------UPDATE USER PROFILE 
const updateProfile = asyncHandler(async (req, res, next) => {
   console.log("f->updateProfile");

  if (req.body.avatar !== "") {

    const user = await User.findById(req.user.id);

    const imageId = user.avatar.public_id;
 
    await cloudinary.v2.uploader.destroy(imageId);

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });

    const newUserData = {
      name: req.body.name,
      email: req.body.email,
      avatar : {
        public_Id: myCloud.public_id,
        url: myCloud.secure_url,
      }
    };

    const u=await User.findByIdAndUpdate(req.user.id, newUserData, {new: true,});

    res.status(200).json({success: true,});

  }else{

    const user = await User.findById(req.user.id);

    user.name=req.body.name;
    user.email=req.body.email;
    await user.save();

    res.status(200).json({success: true,});
  }

});


//---------------------------------- GET ALL USER(admin)
const getAllUser = asyncHandler(async (req, res, next) => {
  console.log("f->getAllUser");

  const users = await User.find();
  res.status(200).json({success: true,users,}); 
});


//---------------------------------GET SINGLE USER(admin)
const getSingleUser = asyncHandler(async (req, res, next) => {
  console.log("f->getSingleUser");

  const user = await User.findById(req.params.id);
  if (!user)  return next(new ApiError(`User does not exist with Id: ${req.params.id}`));
  res.status(200).json({success: true,user,});
});


//--------------------------------UPDATE USE ROLE -- Admin
const updateUserRole = asyncHandler(async (req, res, next) => {
  console.log("f->updateUserRole");

  const {name,email,role}=req.body;

  const newUserData = {
    name: name,
    email: email,
    role: role,
  };

  await User.findByIdAndUpdate(req.params.id, newUserData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
  });
  
  res.status(200).json({success: true,});

});

//---------------------------------DELETE USER --Admin
const deleteUser = asyncHandler(async (req, res, next) => {
  console.log("f->deleteUser");
   
  const user = await User.findById(req.params.id);

  if (!user)  return next( new ApiError(`User does not exist with Id: ${req.params.id}`, 400));

  const imageId = user.avatar.public_id;
  await cloudinary.v2.uploader.destroy(imageId);

  await User.findByIdAndDelete(user._id);
  res.status(200).json({ success: true,message: "User Deleted Successfully"});

});


export {
    registerUser,
    loginUser,
    logoutUser,
    forgotPassword,
    resetPassword,
    getUserDetails,
    updatePassword,
    updateProfile,
    getAllUser,
    getSingleUser,
    updateUserRole,
    deleteUser
    };
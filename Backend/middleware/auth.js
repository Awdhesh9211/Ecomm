import { asyncHandler } from "./asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";


const isAuthenticatedUser = asyncHandler(async (req, res, next) => {
  // console.log(req.cookies);
  const {token} =req.cookies;
  // console.log(token);
  if (!token) {
    return next(new ApiError("Please Login to access this resource", 401));
  }
  const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  console.log(decodedData);
  req.user = await User.findById(decodedData.id);
  next();
});

const authorizeRoles = (...roles) => { return (req, res, next) => {
    if (!roles.includes(req.user.role))  return next( new ApiError(`Role: ${req.user.role} is not allowed to access this resouce `,403));
    next();
  };
};
export { isAuthenticatedUser, authorizeRoles };

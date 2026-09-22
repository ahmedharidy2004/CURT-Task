import AppError from "./../utils/appError.js";

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) 
        throw new AppError("your are not allowed to perform this action!", 403);
    
    next();
  };
};
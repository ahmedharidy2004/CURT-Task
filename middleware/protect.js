import { prisma } from "./../lib/prisma.ts";
import catchAsync from "./../utils/catchAsync.js";
import AppError from "./../utils/appError.js";
import jwt from "jsonwebtoken";

const userSelect = {
    id: true,
    name: true,
    username: true,
    email: true,
    createdAt: true
}

export const protect = catchAsync(async (req, res, next) => {
    if(!req.headers.authorization || !req.headers.authorization.startsWith("Bearer "))
        throw new AppError("you are not allowed to perform this action! please log in", 401);

    const token = req.headers.authorization.split(" ")[1];
    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        throw new AppError("Invalid or expired token", 401);
    }

    const user = await prisma.user.findUnique({
        where: {
            id: decoded.userId
        },
        select: userSelect
    });

    if(!user)
        throw new AppError("User is no longer found!", 401);

    req.user = user;
    next();
})
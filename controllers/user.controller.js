import * as userService from "../services/user.service.js";
import catchAsync from "./../utils/catchAsync.js";

export const getAllUsers = catchAsync(async (req, res) => {
    const users = await userService.getAllUsers();

    res.status(200).json({
        status: "success",
        results: users.length,
        data : {
            users
        }
    });
})

export const getUserById = catchAsync(async (req, res) => {
    const user = await userService.getUserById(req.params.id);

    res.status(200).json({
        status: "success",
        data : {
            user
        }
    });
})
import * as userService from "../services/user.service.js";
import catchAsync from "./../utils/catchAsync.js";

// export const getAllUsers = catchAsync(async (req, res) => {
//     const users = await userService.getAllUsers();

//     res.status(200).json({
//         status: "success",
//         results: users.length,
//         data : {
//             users
//         }
//     });
// })

export const getUser = catchAsync(async (req, res) => {
    const user = await userService.getUser(req.user.id);

    res.status(200).json({
        status: "success",
        data : {
            user
        }
    });
})

export const updateProfile = catchAsync(async (req, res) => {
    const updatedUser = await userService.updateProfile(req.user.id, req.body);

    res.status(200).json({
        status: "success",
        data : {
            updatedUser
        }
    });
})

export const updatePassword = catchAsync(async (req, res) => {
    const updatedUser = await userService.updatePassword(req.user.id, req.body)

    res.status(200).json({
        status: "success",
        message: "Password Updated Successfully!"
    });
})
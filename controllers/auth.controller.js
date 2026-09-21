import catchAsync from "../utils/catchAsync.js";
import * as authService from "../services/auth.service.js";

export const signUp = catchAsync(async(req, res) => {
    const authData = await authService.signUp(req.body);

    res.status(201).json({
        status: "success",
        data: authData
    });
});

export const login = catchAsync(async(req, res) => {
    const token = await authService.login(req.body);

    res.status(200).json({
        status: "success",
        data: {
            token
        }
    });
});

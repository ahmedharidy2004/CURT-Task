import catchAsync from "../utils/catchAsync.js";
import * as taskService from "../services/task.service.js";
import AppError from "../utils/appError.js";

export const getAllTasks = catchAsync(async(req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    
    if (page < 1 || limit < 1 || limit > 100)
        throw new AppError("Page must be positive & limit is between 1 and 100", 400);

    const result = await taskService.getAllTasks(req.user.id, page, limit);

    res.status(200).json({
        status: "success",
        results: result.tasks.length,
        data: {
            tasks: result.tasks,
            pagination: result.pagination
        }
    })
})

export const getTaskById = catchAsync(async(req, res) => {
    const task = await taskService.getTaskById(req.params.id, req.user.id);

    res.status(200).json({
        status: "success",
        data: {
            task
        }
    })
})

export const createTask = catchAsync(async(req, res) => {
    const createdTask = await taskService.createTask(req.body, req.user.id);

    res.status(201).json({
        status: "success",
        data: {
            createdTask
        }
    })
})

export const updateTask = catchAsync(async(req, res) => {
    const updatedTask = await taskService.updateTask(
        req.params.id,
        req.body,
        req.user.id
    );

    res.status(200).json({
        status: "success",
        data: {
            updatedTask
        }
    })
})

export const deleteTask = catchAsync(async(req, res) => {
    await taskService.deleteTask(req.params.id, req.user.id);

    res.status(204).send();
})
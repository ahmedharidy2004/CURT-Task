import catchAsync from "../utils/catchAsync.js";
import * as taskService from "../services/task.service.js";

export const getAllTasks = catchAsync(async(req, res) => {
    const tasks = await taskService.getAllTasks();

    res.status(200).json({
        status: "success",
        results: tasks.length,
        data: {
            tasks
        }
    })
})

export const getTaskById = catchAsync(async(req, res) => {
    const task = await taskService.getTaskById(req.params.id);

    res.status(200).json({
        status: "success",
        data: {
            task
        }
    })
})

export const createTask = catchAsync(async(req, res) => {
    const createdTask = await taskService.createTask(req.body);

    res.status(201).json({
        status: "success",
        data: {
            createdTask
        }
    })
})

export const updateTask = catchAsync(async(req, res) => {
    const updatedTask = await taskService.updateTask(req.params.id, req.body);

    res.status(200).json({
        status: "success",
        data: {
            updatedTask
        }
    })
})

export const deleteTask = catchAsync(async(req, res) => {
    await taskService.deleteTask(req.params.id);

    res.status(204).send();
})
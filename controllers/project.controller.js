import catchAsync from "../utils/catchAsync.js";
import * as projectService from "../services/project.service.js";
import AppError from "./../utils/appError.js";

export const getAllProjects = catchAsync(async(req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const name = req.query.name;

    if (page < 1 || limit < 1 || limit > 100)
        throw new AppError("Page must be positive & limit is between 1 and 100", 400);

    const result = await projectService.getAllProjects(req.user.id, page, limit, { name });

    res.status(200).json({
        status: "success",
        results: result.projects.length,
        data: {
            projects: result.projects,
            pagination: result.pagination
        }
    })
})

export const getProjectById = catchAsync(async(req, res) => {
    const project = await projectService.getProjectById(req.params.id, req.user.id);

    res.status(200).json({
        status: "success",
        data: {
            project
        }
    })
})

export const createProject = catchAsync(async(req, res) => {
    const createdProject = await projectService.createProject(req.body, req.user.id);

    res.status(201).json({
        status: "success",
        data: {
            createdProject
        }
    })
})

export const updateProject = catchAsync(async(req, res) => {
    const updatedProject = await projectService.updateProject(
        req.params.id,
        req.body,
        req.user.id
    );

    res.status(200).json({
        status: "success",
        data: {
            updatedProject
        }
    })
})

export const deleteProject = catchAsync(async(req, res) => {
    await projectService.deleteProject(req.params.id, req.user.id);

    res.status(204).send();
})

export const addProjectMember = catchAsync(async(req, res) => {
    const member = await projectService.addProjectMember(req.params.id, req.user.id, req.body.userId);

    res.status(201).json({
        status: "success",
        data: {
            member
        }
    })
})

export const removeProjectMember = catchAsync(async(req, res) => {
    const result = await projectService.removeProjectMember(req.params.id,req.user.id,req.params.memberId);

    res.status(200).json({
        status: "success",
        data: {
            result
        }
    })
})
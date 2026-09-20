import catchAsync from "../utils/catchAsync.js";
import * as projectService from "../services/project.service.js";

export const getAllProjects = catchAsync(async(req, res) => {
    const projects = await projectService.getAllProjects();

    res.status(200).json({
        status: "success",
        results: projects.length,
        data: {
            projects
        }
    })
})

export const getProjectById = catchAsync(async(req, res) => {
    const project = await projectService.getProjectById(req.params.id);

    res.status(200).json({
        status: "success",
        data: {
            project
        }
    })
})

export const createProject = catchAsync(async(req, res) => {
    const createdProject = await projectService.createProject(req.body);

    res.status(201).json({
        status: "success",
        data: {
            createdProject
        }
    })
})

export const updateProject = catchAsync(async(req, res) => {
    const updatedProject = await projectService.updateProject(req.params.id, req.body);

    res.status(200).json({
        status: "success",
        data: {
            updatedProject
        }
    })
})

export const deleteProject = catchAsync(async(req, res) => {
    await projectService.deleteProject(req.params.id);

    res.status(204).send();
})
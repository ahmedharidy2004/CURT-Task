import { prisma } from '../lib/prisma.ts'
import AppError from './../utils/appError.js'

const projectSelect = {
    id: true,
    name: true,
    description: true,
    owner: {
        select: {
            id: true,
            name: true
        }
    },
    createdAt: true,
    updatedAt: true
}

export const getAllProjects = async () => {
    const projects = await prisma.project.findMany({
        select: projectSelect
    })

    return projects;
}

export const getProjectById = async (projectId) => {
    const project = await prisma.project.findUnique({
        where: {
            id: projectId
        },
        select: projectSelect
    })

    if(!project)
        throw new AppError("Project Not Found!", 404);

    return project;
}

export const createProject = async(body) => {
    try{
        const createdProject = await prisma.project.create({
            data: body,
            select: projectSelect
        });

        return createdProject;
    } catch(err) {
        if(err.code == "P2003")
            throw new AppError(`The owner with the id: ${body.ownerId} does not exist`, 404);

        throw err;
    }
}

export const updateProject = async(projectId, body) => {
    try {
        const updatedProject = await prisma.project.update({
            where: {
                id: projectId
            },
            data: body,
            select: projectSelect
        })

        return updatedProject;
    } catch (err) {
        if(err.code === "P2025") {
            throw new AppError("Project Not Found", 404);
        }

        if(err.code == "P2003")
            throw new AppError(`The owner with the id: ${body.ownerId} does not exist`, 404);

        throw err;
    }
}

export const deleteProject = async(projectId) => {
    try {
        await prisma.project.delete({
            where: {
                id: projectId
            }
        })

    } catch (err) {
        if(err.code === "P2025") {
            throw new AppError("Project Not Found", 404);
        }

        throw err;
    }
}

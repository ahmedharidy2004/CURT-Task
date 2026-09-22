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

const accessCondition = (userId) => ({
    OR: [
        { ownerId: userId },
        {
            projectMembers: {
                some: { userId }
            }
        }
    ]
});

export const getAllProjects = async (userId, page, limit) => {
    const skip = (page - 1) * limit;
    const [projects, total] = await prisma.$transaction([
        prisma.project.findMany({
            where: accessCondition(userId),
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc"
            },
            select: projectSelect
        }),

        prisma.project.count({
            where: accessCondition(userId)
        })
    ])

    return {
        projects,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
}

export const getProjectById = async (projectId, userId) => {
    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            ...accessCondition(userId)
        },
        select: projectSelect
    })

    if(!project)
        throw new AppError("You do not have access to this project", 403);

    return project;
}

export const createProject = async(body, ownerId) => {
    try{
        const createdProject = await prisma.project.create({
            data: {
                name: body.name,
                description: body.description,
                ownerId
            },
            select: projectSelect
        });

        return createdProject;
    } catch(err) {
        if(err.code == "P2003")
            throw new AppError(`The owner with the id: ${ownerId} does not exist`, 404);

        throw err;
    }
}

export const updateProject = async(projectId, body, ownerId) => {
    try {
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                ownerId
            }
        });

        if(!project)
            throw new AppError("You do not have permission to modify this project", 403);

        const updatedProject = await prisma.project.update({
            where: {
                id: projectId
            },
            data: {
                name: body.name,
                description: body.description
            },
            select: projectSelect
        })

        return updatedProject;
    } catch (err) {
        if(err.code === "P2025") {
            throw new AppError("Project Not Found", 404);
        }

        throw err;
    }
}

export const deleteProject = async(projectId, ownerId) => {
    try {
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                ownerId
            }
        });

        if(!project)
            throw new AppError("You do not have permission to delete this project", 403);

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

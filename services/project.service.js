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

export const getAllProjects = async (userId, page, limit, filter = {}) => {
    const skip = (page - 1) * limit;

    const projectWhere = accessCondition(userId);

    if (filter.name) {
        projectWhere.name = {
            contains: filter.name,
            mode: "insensitive"
        };
    }

    const [projects, total] = await prisma.$transaction([
        prisma.project.findMany({
            where: projectWhere,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc"
            },
            select: projectSelect
        }),

        prisma.project.count({
            where: projectWhere
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

export const addProjectMember = async (projectId, ownerId, memberId) => {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { ownerId: true }
    });

    if (!project) {
        throw new AppError("No project found with that Id", 404);
    }

    if (project.ownerId !== ownerId) {
        throw new AppError("You can't do this action", 403);
    }

    const member = await prisma.user.findUnique({
        where: { id: memberId },
        select: { id: true, name: true }
    });

    if (!member) {
        throw new AppError("User not found", 404);
    }

    try {
        const addedMember = await prisma.projectMember.create({
            data: {
                projectId,
                userId: memberId
            },
            select: {
                project: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        return addedMember;
    } catch (err) {
        if (err.code === "P2002") {
            throw new AppError("User is already a member of this project", 409);
        }

        throw err;
    }
}

export const removeProjectMember = async (projectId, ownerId, memberId) => {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { ownerId: true }
    });

    if (!project) {
        throw new AppError("No project found with that Id", 404);
    }

    if (project.ownerId !== ownerId) {
        throw new AppError("You can't do this action", 403);
    }

    if (memberId === project.ownerId) {
        throw new AppError("Project owner cannot be removed from the project", 400);
    }

    const membership = await prisma.projectMember.findUnique({
        where: {
            projectId_userId: {
                projectId,
                userId: memberId
            }
        }
    });

    if (!membership) {
        throw new AppError("User is not a member of this project", 404);
    }

    await prisma.projectMember.delete({
        where: {
            projectId_userId: {
                projectId,
                userId: memberId
            }
        }
    });

    return {
        projectId,
        userId: memberId,
        removed: true
    };
}
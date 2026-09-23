import { prisma } from '../lib/prisma.ts'
import AppError from './../utils/appError.js'

const taskSelect = {
    id: true,
    title: true,
    description: true,
    priority: true,
    status: true,
    assignedMember: {
        select: {
            id: true,
            name: true
        }
    },
    project: {
        select: {
            id: true,
            name: true
        }
    },
    createdAt: true,
    updatedAt: true
}

const projectAccessCondition = (userId) => ({
    OR: [
        { ownerId: userId },
        {
            projectMembers: {
                some: { userId }
            }
        }
    ]
});

const getAccessibleProject = async (projectId, userId) => {
    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            ...projectAccessCondition(userId)
        },
        select: {
            ownerId: true,
            projectMembers: {
                select: { userId: true }
            }
        }
    });

    if(!project)
        throw new AppError("You do not have access to this project", 403);

    return project;
};

// validation for membership of user in specific project
const validateAssignedMember = async (project, assignedTo) => {

    const isProjectMember = project.projectMembers.some(
        (member) => member.userId === assignedTo
    );

    if(project.ownerId !== assignedTo && !isProjectMember)
        throw new AppError("Assigned user is not a member of this project", 403);
};

/////////////////////////////////////////////////////////////////////////////////
export const getAllTasks = async (userId, page, limit, filter = {}) => {

    const taskWhere = {
        project: projectAccessCondition(userId),
        status: filter.status,
        priority: filter.priority,
        assignedTo: filter.assignedTo,
        projectId: filter.projectId
    }

    const skip = (page - 1) * limit;

    const [tasks, total] = await prisma.$transaction([
        prisma.task.findMany({
            where: taskWhere,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc"
            },
            select: taskSelect
        }),

        prisma.task.count({
            where: taskWhere
        })
    ])

    return {
        tasks,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
}

/////////////////////////////////////////////////////////////////////////////////
export const getTaskById = async (taskId, userId) => {
    const task = await prisma.task.findFirst({
        where: {
            id: taskId,
            project: projectAccessCondition(userId)
        },
        select: taskSelect
    });

    if(!task)
        throw new AppError("You do not have access to this task", 403);

    return task;
}

export const createTask = async (body, userId) => {
    try {
        const { title, description, priority, status, assignedTo, projectId } = body;
        const project = await getAccessibleProject(projectId, userId);
        await validateAssignedMember(project, assignedTo);

        const createdTask = await prisma.task.create({
            data: {
                title,
                description,
                priority,
                status,
                assignedTo,
                projectId
            },
            select: taskSelect
        });

        return createdTask;
    } catch(err) {
        if(err.code === "P2003") {
            throw new AppError("The member or project assigned Not Found!", 404);
        }

        throw err;
    }
}

/////////////////////////////////////////////////////////////////////////////////
export const updateTask = async (taskId, body, userId) => {
    try {
        const { title, description, priority, status, assignedTo, projectId } = body;

        const existingTask = await prisma.task.findFirst({
            where: {
                id: taskId,
                project: projectAccessCondition(userId)
            },
            select: { projectId: true, assignedTo: true }
        });

        if(!existingTask)
            throw new AppError("You do not have access to this task", 403);

        const targetProjectId = projectId ?? existingTask.projectId;
        const project = await getAccessibleProject(targetProjectId, userId);
        await validateAssignedMember(project, assignedTo ?? existingTask.assignedTo);

        const updatedTask = await prisma.task.update({
            where : {
                id: taskId
            },
            data: {
                title,
                description,
                priority,
                status,
                assignedTo,
                projectId
            },
            select: taskSelect
        })

        return updatedTask;
    } catch(err) {
        if(err.code === "P2025")
            throw new AppError("The task is not found!", 404);

        if (err.code === "P2003")
            throw new AppError("The member or project assigned Not Found!", 404);

        throw err;
    }
}

/////////////////////////////////////////////////////////////////////////////////
export const updateTaskStatus = async (taskId, status, userId) => {
    const task = await prisma.task.findFirst({
        where: {
            id: taskId,
            assignedTo: userId,
            project: {
                projectMembers: {
                    some: { userId }
                }
            }
        }
    });

    if(!task)
        throw new AppError("You can only update the status of a task assigned to you", 403);

    return prisma.task.update({
        where: { id: taskId },
        data: { status },
        select: taskSelect
    });
}

/////////////////////////////////////////////////////////////////////////////////
export const deleteTask = async (taskId, userId) => {
    try {
        const task = await prisma.task.findFirst({
            where: {
                id: taskId,
                project: {
                    ownerId: userId
                }
            }
        });

        if(!task)
            throw new AppError("You do not have permission to delete this task", 403);

        await prisma.task.delete({
            where : {
                id: taskId
            }
        })
    } catch(err) {
        if(err.code === "P2025")
            throw new AppError("The task is not found!", 404);

        throw err;
    }
}

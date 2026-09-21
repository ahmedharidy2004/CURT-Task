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

export const getAllTasks = async () => {
    const tasks = await prisma.task.findMany({
        select: taskSelect
    })

    return tasks;
}

export const getTaskById = async (taskId) => {
    const task = await prisma.task.findUnique({
        where: {
            id: taskId
        },
        select: taskSelect
    });

    if(!task)
        throw new AppError("Task Not Found!", 404);

    return task;
}

export const createTask = async (body) => {
    try {
        const { title, description, priority, status, assignedTo, projectId } = body;

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

export const updateTask = async (taskId, body) => {
    try {
        const { title, description, priority, status, assignedTo, projectId } = body;
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

export const deleteTask = async (taskId) => {
    try {
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

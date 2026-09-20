import { prisma } from '../lib/prisma.ts'
import AppError from './../utils/appError.js'

const userSelect = {
    id: true,
    name: true,
    username: true,
    email: true,
    createdAt: true
}

export const getAllUsers = async() => {
    const users = await prisma.user.findMany({
        select: userSelect
    })

    return users;
}

export const getUserById = async(userId) => {
    const user = await prisma.user.findUnique({
        where : {
            id: userId
        },
        select: userSelect
    })

    if(!user) {
        throw new AppError("User Not Found!", 404);
    }

    return user;
}

export const createUser = async(body) => {
    const { name, username, email, password } = body;

    const createdUser = await prisma.user.create(
        {
            data: {
                name,
                username,
                email,
                password
            },
            select: userSelect
        }
    )

    return createdUser;
}
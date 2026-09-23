import { prisma } from '../lib/prisma.ts'
import AppError from './../utils/appError.js'
import bcrypt from "bcrypt";

const userSelect = {
    id: true,
    name: true,
    username: true,
    email: true,
    createdAt: true,
    updatedAt: true
}

// export const getAllUsers = async() => {
//     const users = await prisma.user.findMany({
//         select: userSelect
//     })

//     return users;
// }

export const getUser = async(userId) => {
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

export const updateProfile = async(userId, body) => {
    try {
        const { name, username, email } = body;
        const updatedUser = await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                name,
                username,
                email
            },
            select: userSelect
        });

        return updatedUser;
    } catch (err) {
        if(err.code === "P2002")
            throw new AppError("The username or email you entered already exists!", 400);
    }
}

export const updatePassword = async(userId, body) => {
    const { currentPassword, newPassword} = body;
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if(!isPasswordValid) 
        throw new AppError("Current Password is Invalid", 400);

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
        where: {
            id: userId
        },
        data : {
            password: hashedPassword
        }
    })
}
import { prisma } from '../lib/prisma.ts';
import AppError from './../utils/appError.js';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSelect = {
    id: true,
    name: true,
    username: true,
    email: true,
    createdAt: true
}

export const signUp = async(body) => {
    try {
        const { name, username, email, password } = body;
        const hashedPassword = await bcrypt.hash(password, 12);

        const createdUser = await prisma.user.create({
            data: {
                name,
                username,
                email,
                password: hashedPassword
            },
            select: userSelect
        });

        const token = jwt.sign(
            { userId: createdUser.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        )

        return {
            user: {
                id: createdUser.id,
                name: createdUser.name,
                username: createdUser.username,
                email: createdUser.email,
                createdAt: createdUser.createdAt
            },
            token
        };

    } catch(err) {
        if (err.code === "P2002")
            throw new AppError("This username or email already exists", 400);

        throw err;
    }
}

export const login = async(body) => {
    const { email, password } = body;
    const user = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if(!user) 
        throw new AppError("Invalid Email or Password", 401);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid) 
        throw new AppError("Invalid Email or Password", 401);

    const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    return token;
}
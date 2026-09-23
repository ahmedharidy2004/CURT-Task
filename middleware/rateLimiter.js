import rateLimit from "express-rate-limit";

const createLimiter = (windowMs, limit, message) =>
    rateLimit({
        windowMs,
        limit,
        standardHeaders: "draft-8",
        legacyHeaders: false,
        message: {
            status: "fail",
            message
        }
    });

export const authLimiter = createLimiter(
    15 * 60 * 1000,
    10,
    "Too many authentication attempts. Please try again later."
);
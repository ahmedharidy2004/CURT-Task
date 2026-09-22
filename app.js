import express from "express";
import authRoutes from "./routes/auth.router.js";
import userRoutes from "./routes/user.router.js";
import projectRoutes from "./routes/project.router.js";
import taskRoutes from "./routes/task.router.js";
import errorHandler from "./utils/errorHandler.js";

const app = express();

app.use(express.json());
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/projects", projectRoutes);
app.use("/tasks", taskRoutes);

app.use(errorHandler);

export default app;
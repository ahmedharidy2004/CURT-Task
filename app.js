import express from "express";
import userRoutes from "./routes/user.router.js";
import projectRoutes from "./routes/project.router.js";
import taskRoutes from "./routes/task.router.js";

const app = express();

app.use(express.json());
app.use("/users", userRoutes);
app.use("/projects", projectRoutes);
app.use("/tasks", taskRoutes);

export default app;
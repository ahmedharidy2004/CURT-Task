import express from "express";
import userRoutes from "./routes/user.router.js";
import projectRoutes from "./routes/project.router.js";

const app = express();

app.use(express.json());
app.use("/users", userRoutes);
app.use("/projects", projectRoutes);

export default app;
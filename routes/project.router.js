import * as projectController from "../controllers/project.controller.js";
import express from "express";

const router = express.Router();

router.route("/")
        .get(projectController.getAllProjects)
        .post(projectController.createProject)

router.route("/:id")
        .get(projectController.getProjectById)
        .patch(projectController.updateProject)
        .delete(projectController.deleteProject)

export default router;
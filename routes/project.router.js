import * as projectController from "../controllers/project.controller.js";
import express from "express";
import { createProjectValidator,updateProjectValidator,handleValidationErrors } from "../middleware/Validators.js";
import { protect } from "./../middleware/protect.js";

const router = express.Router();

router.use(protect);

router.route("/")
        .get(projectController.getAllProjects)
        .post(createProjectValidator, handleValidationErrors, projectController.createProject)

router.route("/:id")
        .get(projectController.getProjectById)
        .patch(updateProjectValidator, handleValidationErrors, projectController.updateProject)
        .delete(projectController.deleteProject)

export default router;
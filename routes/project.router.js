import * as projectController from "../controllers/project.controller.js";
import express from "express";
import { createProjectValidator,updateProjectValidator,handleValidationErrors } from "../middleware/Validators.js";
import { protect } from "./../middleware/protect.js";
import { restrictTo } from "../middleware/restrictTo.js";

const router = express.Router();

router.use(protect);

router.route("/")
        .get(projectController.getAllProjects)
        .post(createProjectValidator, handleValidationErrors, projectController.createProject)

router.route("/:id")
        .get(projectController.getProjectById)
        .patch(restrictTo("OWNER"), updateProjectValidator, handleValidationErrors, projectController.updateProject)
        .delete(restrictTo("OWNER"), projectController.deleteProject)

router.route("/:id/members")
        .post(restrictTo("OWNER"), projectController.addProjectMember)

router.route("/:id/members/:memberId")
        .delete(restrictTo("OWNER"), projectController.removeProjectMember)

router.route("/:id/members/:memberId/role")
        .patch(restrictTo("OWNER"), projectController.setRole)

export default router;
import * as taskController from "../controllers/task.controller.js";
import express from "express";
import { createTaskValidator,updateTaskValidator,handleValidationErrors } from "../middleware/Validators.js";
import { protect } from "./../middleware/protect.js";

const router = express.Router();

router.use(protect);

router.route("/")
        .get(taskController.getAllTasks)
        .post(createTaskValidator, handleValidationErrors, taskController.createTask)

router.route("/:id")
        .get(taskController.getTaskById)
        .patch(updateTaskValidator, handleValidationErrors, taskController.updateTask)
        .delete(taskController.deleteTask)

export default router;
import * as taskController from "../controllers/task.controller.js";
import express from "express";
import { createTaskValidator,updateTaskValidator,updateTaskStatusValidator,handleValidationErrors } from "../middleware/Validators.js";
import { protect } from "./../middleware/protect.js";
import { restrictTo } from "../middleware/restrictTo.js";

const router = express.Router();

router.use(protect);

router.route("/")
        .get(taskController.getAllTasks)
        .post(restrictTo("OWNER"),createTaskValidator, handleValidationErrors, taskController.createTask)

router.route("/:id")
        .get(taskController.getTaskById)
        .patch(restrictTo("OWNER"),updateTaskValidator, handleValidationErrors, taskController.updateTask)
        .delete(restrictTo("OWNER"), taskController.deleteTask)

router.patch(
        "/:id/status",
        updateTaskStatusValidator,
        handleValidationErrors,
        taskController.updateTaskStatus
)

export default router;
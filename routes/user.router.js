import * as userController from "./../controllers/user.controller.js";
import express from "express";
import { createUserValidator,handleValidationErrors } from "../middleware/Validators.js";

const router = express.Router();

router.route("/")
        .get(userController.getAllUsers)

router.route("/:id")
        .get(userController.getUserById);

export default router;
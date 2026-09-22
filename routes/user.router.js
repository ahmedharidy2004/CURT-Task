import * as userController from "./../controllers/user.controller.js";
import express from "express";
import { protect } from "./../middleware/protect.js";

const router = express.Router();

router.route("/")
        .get(protect, userController.getAllUsers)

router.route("/:id")
        .get(protect, userController.getUserById);

export default router;
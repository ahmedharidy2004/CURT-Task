import * as userController from "./../controllers/user.controller.js";
import express from "express";

const router = express.Router();

router.route("/")
        .get(userController.getAllUsers)
        .post(userController.createUser);

router.route("/:id")
        .get(userController.getUserById);

export default router;
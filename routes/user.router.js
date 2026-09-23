import * as userController from "./../controllers/user.controller.js";
import express from "express";
import { protect } from "./../middleware/protect.js";

const router = express.Router();

// router.route("/")
//         .get(protect, userController.getAllUsers)

router.route("/me")
        .get(protect, userController.getUserById)
        .patch(protect, userController.updateProfile);

router.route("/updatePassword").patch(protect, userController.updatePassword);

export default router;
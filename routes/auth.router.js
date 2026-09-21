import * as authController from "../controllers/auth.controller.js";
import express from "express";
import {
	createUserValidator,
	loginValidator,
	handleValidationErrors
} from "../middleware/Validators.js";

const router = express.Router();

router.post(
	"/signup",
	createUserValidator,
	handleValidationErrors,
	authController.signUp
);

router.post(
	"/login",
	loginValidator,
	handleValidationErrors,
	authController.login
);

export default router;

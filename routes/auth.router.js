import * as authController from "../controllers/auth.controller.js";
import express from "express";
import {
	createUserValidator,
	loginValidator,
	handleValidationErrors
} from "../middleware/Validators.js";
import { authLimiter } from "./../middleware/rateLimiter.js";

const router = express.Router();

router.use(authLimiter);

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

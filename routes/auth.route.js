import express from "express";
import * as authController from "../controllers/auth.controller.js";
import { validate, registerSchema, loginSchema, changePasswordSchema } from "../validators/user.validator.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes (login/logout)
router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);

// Routes that needs auth
router.get("/me", authenticate, authController.getMe);
router.post("/refresh", authenticate, authController.refreshToken);
router.post("/change-password", authenticate, validate(changePasswordSchema), authController.changePassword);
router.post("/logout", authenticate, authController.logout);

export default router;

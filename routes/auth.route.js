import express from "express";
import * as authController from "../controllers/authController/auth.controller.js";
import { registerSchema, loginSchema } from "../schemas/auth.schema.js";
import { requireAdmin, requireAuth, validate, requireOwnerOrAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register",        validate(registerSchema), authController.register);
router.post("/login",           validate(loginSchema), authController.login);
router.get("/me",               requireAuth, authController.getMe);
router.post("/refresh",         requireAuth, authController.refreshToken);
router.post("/logout",          requireAuth, authController.logout);

export default router;

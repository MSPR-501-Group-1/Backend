import express from "express";
import * as authController from "../controllers/authController/auth.controller.js";
import { registerSchema, loginSchema } from "../schemas/auth.schema.js";
import { validate, authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register",        validate(registerSchema), authController.register);
router.post("/login",           validate(loginSchema), authController.login);
router.get("/me",               authenticate, authController.getMe);
router.post("/refresh",         authenticate, authController.refreshToken);
router.post("/logout",          authenticate, authController.logout);

export default router;

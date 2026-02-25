import express from "express";
import * as controller from "../controllers/user.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate, updateUserSchema, adminUpdateUserSchema, registerSchema } from "../validators/user.validator.js";

const router = express.Router();

// All routes need auth
router.use(authenticate);

// Admins only
router.get("/", authorize("ADMIN"), controller.getUsers);
router.post("/", authorize("ADMIN"), validate(registerSchema), controller.createUser);
router.delete("/:id/hard", authorize("ADMIN"), controller.hardDeleteUser);
router.get("/:id", authorize("ADMIN"), controller.getUserById);
router.delete("/:id", authorize("ADMIN"), controller.softDeleteUser);

// Update route accessible to Admins and simple users (partially)
router.put("/:id", authorize("ADMIN"), validate(adminUpdateUserSchema), controller.updateUser);

export default router;

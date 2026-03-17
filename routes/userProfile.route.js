import express from "express";
import * as controller from "../controllers/userController/userProfile.controller.js";
import { validate, requireAuth, requireAdmin, requireOwnerOrAdmin } from "../middlewares/auth.middleware.js";
import { createUserProfileSchema, updateUserProfileSchema } from "../schemas/userProfile.schema.js";

const router = express.Router();

router.post("/",        requireAuth, requireAdmin, validate(createUserProfileSchema), controller.createUserProfile);
router.get("/:id",      requireAuth, requireAdmin, controller.getUserProfile);
router.put("/:id",      requireAuth, requireAdmin, validate(updateUserProfileSchema), controller.updateUserProfile);
router.delete("/:id",   requireAuth, requireAdmin, controller.deleteUserProfile);

export default router;

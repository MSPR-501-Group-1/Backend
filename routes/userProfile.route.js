import express from "express";
import * as controller from "../controllers/userController/userProfile.controller.js";
import { validate, authenticate, requireRole, requireOwnerOrAdmin } from "../middlewares/auth.middleware.js";
import { createUserProfileSchema, updateUserProfileSchema } from "../schemas/userProfile.schema.js";

const router = express.Router();

router.post("/:id", authenticate, requireOwnerOrAdmin, validate(createUserProfileSchema), controller.createUserProfile);
router.get("/:id", authenticate, requireOwnerOrAdmin, controller.getUserProfile);
router.put("/:id", authenticate, requireOwnerOrAdmin, validate(updateUserProfileSchema), controller.updateUserProfile);
router.delete("/:id", authenticate, requireRole("ADMIN"), controller.deleteUserProfile);

export default router;
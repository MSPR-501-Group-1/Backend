import express from "express";
import * as controller from "../controllers/userController/user.controller.js";
import { validate, requireAuth, requireOwnerOrAdmin, requireAdmin, selectUpdateSchema } from "../middlewares/auth.middleware.js";
import { changePasswordSchema } from "../schemas/user.schema.js";

const router = express.Router();

router.get("/",             requireAuth, requireAdmin, controller.getUsers);
router.post("/",            requireAuth, requireAdmin, selectUpdateSchema, controller.createUser);
router.delete("/:id/hard",  requireAuth, requireAdmin, controller.hardDeleteUser);
router.get("/:id",          requireAuth, requireOwnerOrAdmin, controller.getUserById);
router.delete("/:id",       requireAuth, requireOwnerOrAdmin, controller.softDeleteUser);
router.put("/:id",          requireAuth, requireOwnerOrAdmin, selectUpdateSchema, controller.updateUser);
router.put("/:id/password", requireAuth, requireOwnerOrAdmin, validate(changePasswordSchema), controller.changePassword);

export default router;

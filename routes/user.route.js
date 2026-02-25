import express from "express";
import * as controller from "../controllers/user.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate, updateUserSchema, adminUpdateUserSchema, registerSchema, changePasswordSchema } from "../validators/user.validator.js";

const router = express.Router();

// Public registration route (no auth)
router.post("/register", validate(registerSchema), controller.createUser);

// From here, routes require authentication
router.use(authenticate);

// Admins only
router.get("/", authorize("ADMIN"), controller.getUsers);
router.post("/", authorize("ADMIN"), validate(registerSchema), controller.createUser);
router.delete("/:id/hard", authorize("ADMIN"), controller.hardDeleteUser);
router.get("/:id", authorize("ADMIN"), controller.getUserById);
router.delete("/:id", authorize("ADMIN"), controller.softDeleteUser);

// Update route: keep admin-only for full update
// Allow admins to fully update, and allow users to partially update their own profile
router.put(
	"/:id",
	(req, res, next) => {
		// owner or admin check
		if (!req.user) {
			return res.status(401).json({ success: false, message: "Non authentifié" });
		}
		if (req.user.role_code === "ADMIN") {
			req._updateSchema = adminUpdateUserSchema;
			return next();
		}
		if (req.user.user_id === req.params.id) {
			req._updateSchema = updateUserSchema;
			return next();
		}
		return res.status(403).json({ success: false, message: "Accès non autorisé" });
	},
	(req, res, next) => validate(req._updateSchema)(req, res, next),
	controller.updateUser
);

// Password change: allowed for owner or admin
router.put(
	"/:id/password",
	(req, res, next) => {
		if (!req.user) {
			return res.status(401).json({ success: false, message: "Non authentifié" });
		}
		if (req.user.role_code !== "ADMIN" && req.user.user_id !== req.params.id) {
			return res.status(403).json({ success: false, message: "Accès non autorisé" });
		}
		next();
	},
	validate(changePasswordSchema),
	controller.changePassword
);

export default router;

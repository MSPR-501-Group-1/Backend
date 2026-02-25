import express from "express";
import * as controller from "../controllers/progressTracker.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../validators/user.validator.js";
import { progressTrackerSchema } from "../validators/schemas.js";

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("ADMIN"), controller.getProgressTrackers);
router.post("/", authorize("ADMIN"), validate(progressTrackerSchema), controller.createProgressTracker);
router.get("/:id", authorize("ADMIN"), controller.getProgressTrackerById);
router.put("/:id", authorize("ADMIN"), validate(progressTrackerSchema), controller.updateProgressTracker);
router.delete("/:id", authorize("ADMIN"), controller.deleteProgressTracker);

export default router;

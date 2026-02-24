import express from "express";
import * as controller from "../controllers/healthGoal.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../validators/user.validator.js";
import { healthGoalSchema } from "../validators/schemas.js";

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("ADMIN"), controller.getHealthGoals);
router.post("/", authorize("ADMIN"), validate(healthGoalSchema), controller.createHealthGoal);
router.get("/:id", authorize("ADMIN"), controller.getHealthGoalById);
router.put("/:id", authorize("ADMIN"), validate(healthGoalSchema), controller.updateHealthGoal);
router.delete("/:id", authorize("ADMIN"), controller.deleteHealthGoal);

export default router;

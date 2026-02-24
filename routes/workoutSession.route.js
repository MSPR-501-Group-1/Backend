import express from "express";
import * as controller from "../controllers/workoutSession.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../validators/user.validator.js";
import { workoutSessionSchema } from "../validators/schemas.js";

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("ADMIN"), controller.getWorkoutSessions);
router.post("/", authorize("ADMIN"), validate(workoutSessionSchema), controller.createWorkoutSession);
router.get("/:id", authorize("ADMIN"), controller.getWorkoutSessionById);
router.put("/:id", authorize("ADMIN"), validate(workoutSessionSchema), controller.updateWorkoutSession);
router.delete("/:id", authorize("ADMIN"), controller.deleteWorkoutSession);

export default router;

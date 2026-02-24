import express from "express";
import * as controller from "../controllers/exercise.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../validators/user.validator.js";
import { exerciseSchema } from "../validators/schemas.js";

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("ADMIN"), controller.getExercises);
router.post("/", authorize("ADMIN"), validate(exerciseSchema), controller.createExercise);
router.get("/:id", authorize("ADMIN"), controller.getExerciseById);
router.put("/:id", authorize("ADMIN"), validate(exerciseSchema), controller.updateExercise);
router.delete("/:id", authorize("ADMIN"), controller.deleteExercise);

export default router;

import express from "express";
import * as controller from "../controllers/biometricMeasure.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../validators/user.validator.js";
import { biometricMeasureSchema } from "../validators/schemas.js";

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("ADMIN"), controller.getBiometricMeasures);
router.post("/", authorize("ADMIN"), validate(biometricMeasureSchema), controller.createBiometricMeasure);
router.get("/:id", authorize("ADMIN"), controller.getBiometricMeasureById);
router.put("/:id", authorize("ADMIN"), validate(biometricMeasureSchema), controller.updateBiometricMeasure);
router.delete("/:id", authorize("ADMIN"), controller.deleteBiometricMeasure);

export default router;

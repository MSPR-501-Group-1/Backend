import express from "express";
import * as controller from "../controllers/userMetrics.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../validators/user.validator.js";
import { userMetricsSchema } from "../validators/schemas.js";

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("ADMIN"), controller.getUserMetrics);
router.post("/", authorize("ADMIN"), validate(userMetricsSchema), controller.createUserMetric);
router.get("/:id", authorize("ADMIN"), controller.getUserMetricById);
router.put("/:id", authorize("ADMIN"), validate(userMetricsSchema), controller.updateUserMetric);
router.delete("/:id", authorize("ADMIN"), controller.deleteUserMetric);

export default router;

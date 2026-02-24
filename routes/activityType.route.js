import express from "express";
import * as controller from "../controllers/activityType.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../validators/user.validator.js";
import { activityTypeSchema } from "../validators/schemas.js";

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("ADMIN"), controller.getActivityTypes);
router.post("/", authorize("ADMIN"), validate(activityTypeSchema), controller.createActivityType);
router.get("/:id", authorize("ADMIN"), controller.getActivityTypeById);
router.put("/:id", authorize("ADMIN"), validate(activityTypeSchema), controller.updateActivityType);
router.delete("/:id", authorize("ADMIN"), controller.deleteActivityType);

export default router;

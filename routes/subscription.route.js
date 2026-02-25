import express from "express";
import * as controller from "../controllers/subscription.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../validators/user.validator.js";
import { subscriptionSchema } from "../validators/schemas.js";

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("ADMIN"), controller.getSubscriptions);
router.post("/", authorize("ADMIN"), validate(subscriptionSchema), controller.createSubscription);
router.get("/:id", authorize("ADMIN"), controller.getSubscriptionById);
router.put("/:id", authorize("ADMIN"), validate(subscriptionSchema), controller.updateSubscription);
router.delete("/:id", authorize("ADMIN"), controller.deleteSubscription);

export default router;

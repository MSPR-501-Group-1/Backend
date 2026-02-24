import express from "express";
import * as controller from "../controllers/subscriptionPlan.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate, adminUpdateUserSchema, registerSchema, subscriptionPlanSchema } from "../validators/user.validator.js";

const router = express.Router();

// All routes need auth
router.use(authenticate);

// Get all
router.get("/", authorize("ADMIN"), controller.getSubscriptionPlans);

// Post
router.post("/", authorize("ADMIN"), validate(subscriptionPlanSchema), controller.createSubscriptionPlan);

// Get by ID
router.get("/:id", authorize("ADMIN"), controller.getSubscriptionPlanById);

// Delete
router.delete("/:id", authorize("ADMIN"), controller.deleteSubscriptionPlan);

// Update
router.put("/:id", authorize("ADMIN"), validate(subscriptionPlanSchema), controller.updateSubscriptionPlan);

export default router;
import express from "express";
import * as controller from "../controllers/userController/userMetrics.controller.js";
import { requireRole, authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/fitness", authenticate, requireRole("ADMIN", "PREMIUM", "PREMIUM_PLUS", "B2B"), controller.getFitnessMetrics);
router.get("/usersMetrics", authenticate, requireRole("ADMIN"), controller.getAllUsersMetrics);

export default router;
import express from "express";
import * as controller from "../controllers/analyticsController/businessKpi.controller.js";
import { requireRole, authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/business", authenticate, requireRole("ADMIN", "PREMIUM_PLUS", "B2B"), controller.getBusinessKpis);

export default router;

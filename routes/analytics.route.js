import express from "express";
import * as controller from "../controllers/analyticsController/businessKpi.controller.js";
import * as anomalyController from "../controllers/analyticsController/dataAnomaly.controller.js";
import { requireRole, authenticate, ROLE_GROUPS } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/dashboard", authenticate, requireRole(...ROLE_GROUPS.ANALYTICS), controller.getDashboard);

router.get("/business", authenticate, requireRole(...ROLE_GROUPS.BUSINESS_ANALYTICS), controller.getBusinessKpis);
router.get("/nutrition", authenticate, requireRole(...ROLE_GROUPS.ANALYTICS), controller.getNutritionAnalytics);
router.get("/biometric", authenticate, requireRole(...ROLE_GROUPS.ANALYTICS), controller.getBiometricAnalytics);
router.get("/score", authenticate, requireRole(...ROLE_GROUPS.DATA_QUALITY), controller.getDataQualityScore);

router.get("/", authenticate, requireRole(...ROLE_GROUPS.PARTNERS), controller.getPartners);
router.get("/dashboard", authenticate, requireRole(...ROLE_GROUPS.PARTNERS), controller.getPartnersDashboard);

router.get("/anomalies", authenticate, requireRole(...ROLE_GROUPS.DATA_QUALITY), anomalyController.getAnomalies);
router.patch("/anomalies/:id/correct", authenticate, requireRole(...ROLE_GROUPS.DATA_QUALITY), anomalyController.correctAnomaly);

export { router as default };
import express from "express";
import * as controller from "../controllers/analyticsController/businessKpi.controller.js";
import { requireRole, authenticate, ROLE_GROUPS } from "../middlewares/auth.middleware.js";

const analyticsRouter = express.Router();
const partnersRouter = express.Router();
const dataQualityRouter = express.Router();
const dashboardRouter = express.Router();

dashboardRouter.get("/dashboard", authenticate, requireRole(...ROLE_GROUPS.ANALYTICS), controller.getDashboard);

analyticsRouter.get("/business", authenticate, requireRole(...ROLE_GROUPS.BUSINESS_ANALYTICS), controller.getBusinessKpis);
analyticsRouter.get("/nutrition", authenticate, requireRole(...ROLE_GROUPS.ANALYTICS), controller.getNutritionAnalytics);
analyticsRouter.get("/biometric", authenticate, requireRole(...ROLE_GROUPS.ANALYTICS), controller.getBiometricAnalytics);
dataQualityRouter.get("/score", authenticate, requireRole(...ROLE_GROUPS.DATA_QUALITY), controller.getDataQualityScore);

partnersRouter.get("/", authenticate, requireRole(...ROLE_GROUPS.PARTNERS), controller.getPartners);
partnersRouter.get("/dashboard", authenticate, requireRole(...ROLE_GROUPS.PARTNERS), controller.getPartnersDashboard);

export { partnersRouter, dataQualityRouter, dashboardRouter };
export default analyticsRouter;

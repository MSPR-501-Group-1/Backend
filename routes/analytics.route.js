import express from "express";
import * as controller from "../controllers/analyticsController/businessKpi.controller.js";
import { requireRole, authenticate, ROLE_GROUPS } from "../middlewares/auth.middleware.js";

const analyticsRouter = express.Router();
const partnersRouter = express.Router();

analyticsRouter.get("/business", authenticate, requireRole(...ROLE_GROUPS.BUSINESS_ANALYTICS), controller.getBusinessKpis);
analyticsRouter.get("/nutrition", authenticate, requireRole(...ROLE_GROUPS.ANALYTICS), controller.getNutritionAnalytics);
analyticsRouter.get("/biometric", authenticate, requireRole(...ROLE_GROUPS.ANALYTICS), controller.getBiometricAnalytics);

partnersRouter.get("/", authenticate, requireRole(...ROLE_GROUPS.PARTNERS), controller.getPartners);
partnersRouter.get("/dashboard", authenticate, requireRole(...ROLE_GROUPS.PARTNERS), controller.getPartnersDashboard);

export { partnersRouter };
export default analyticsRouter;

import express from "express";
import * as controller from "../controllers/userController/userMetrics.controller.js";
import { requireRole, authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/usersMetrics",       authenticate, requireRole("ADMIN"), controller.getAllUsersMetrics);

export default router;
import express from "express";
import * as controller from "../controllers/etlController/etl.controller.js";
import { authenticate, requireRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Récupère toutes les exécutions de pipelines ETL avec leur status et infos (Ydatas / datas)
router.get("/etlExecutions", controller.getEtlExecutions);

// Lance une pipeline d'ETL spécifique
router.post("/:pipeline", authenticate, requireRole("ADMIN"), controller.launchEtlPipeline);

// Récupère le status d'une pipeline ETL + des infos (Ydatas / datas)
router.get("/:id", authenticate, requireRole("ADMIN"), controller.getEtlById);

// Validate and push ETL data to database (uses status returned by ETL API)
router.post("/validate/:id", authenticate, requireRole("ADMIN"), controller.markEtlAsLoaded);
router.post("/reject/:id", authenticate, requireRole("ADMIN"), controller.markEtlAsRejected);
router.delete("/:id", authenticate, requireRole("ADMIN"), controller.deleteEtlExecution);

export default router;

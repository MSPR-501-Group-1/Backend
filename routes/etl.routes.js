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

// Permet de push les datas d'une pipeline ETL sur la base de données
router.post("/pushEtl/:id", authenticate, requireRole("ADMIN"), controller.pushEtlData);

// Modify the status of an ETL execution (after validation by the admin)
router.post("/validate/:id", authenticate, requireRole("ADMIN"), controller.markEtlAsLoaded);
router.post("/reject/:id", authenticate, requireRole("ADMIN"), controller.markEtlAsRejected);
router.delete("/:id", authenticate, requireRole("ADMIN"), controller.deleteEtlExecution);

export default router;

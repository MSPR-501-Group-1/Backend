import express from "express";
import * as controller from "../controllers/dataAnomaly.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../validators/user.validator.js";
import { dataAnomalySchema } from "../validators/schemas.js";

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("ADMIN"), controller.getDataAnomalies);
router.post("/", authorize("ADMIN"), validate(dataAnomalySchema), controller.createDataAnomaly);
router.get("/:id", authorize("ADMIN"), controller.getDataAnomalyById);
router.put("/:id", authorize("ADMIN"), validate(dataAnomalySchema), controller.updateDataAnomaly);
router.delete("/:id", authorize("ADMIN"), controller.deleteDataAnomaly);

export default router;

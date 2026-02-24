import express from "express";
import * as controller from "../controllers/dataQualityCheck.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../validators/user.validator.js";
import { dataQualityCheckSchema } from "../validators/schemas.js";

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("ADMIN"), controller.getDataQualityChecks);
router.post("/", authorize("ADMIN"), validate(dataQualityCheckSchema), controller.createDataQualityCheck);
router.get("/:id", authorize("ADMIN"), controller.getDataQualityCheckById);
router.put("/:id", authorize("ADMIN"), validate(dataQualityCheckSchema), controller.updateDataQualityCheck);
router.delete("/:id", authorize("ADMIN"), controller.deleteDataQualityCheck);

export default router;

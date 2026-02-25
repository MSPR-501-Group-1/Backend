import express from "express";
import * as controller from "../controllers/etlExecution.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../validators/user.validator.js";
import { etlExecutionSchema } from "../validators/schemas.js";

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("ADMIN"), controller.getEtlExecutions);
router.post("/", authorize("ADMIN"), validate(etlExecutionSchema), controller.createEtlExecution);
router.get("/:id", authorize("ADMIN"), controller.getEtlExecutionById);
router.put("/:id", authorize("ADMIN"), validate(etlExecutionSchema), controller.updateEtlExecution);
router.delete("/:id", authorize("ADMIN"), controller.deleteEtlExecution);

export default router;

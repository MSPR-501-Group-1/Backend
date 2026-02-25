import express from "express";
import * as controller from "../controllers/sessionDetail.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../validators/user.validator.js";
import { sessionDetailSchema } from "../validators/schemas.js";

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("ADMIN"), controller.getSessionDetails);
router.post("/", authorize("ADMIN"), validate(sessionDetailSchema), controller.createSessionDetail);
router.get("/:id", authorize("ADMIN"), controller.getSessionDetailById);
router.put("/:id", authorize("ADMIN"), validate(sessionDetailSchema), controller.updateSessionDetail);
router.delete("/:id", authorize("ADMIN"), controller.deleteSessionDetail);

export default router;

import express from "express";
import * as controller from "../controllers/connectedDevice.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../validators/user.validator.js";
import { connectedDeviceSchema } from "../validators/schemas.js";

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("ADMIN"), controller.getConnectedDevices);
router.post("/", authorize("ADMIN"), validate(connectedDeviceSchema), controller.createConnectedDevice);
router.get("/:id", authorize("ADMIN"), controller.getConnectedDeviceById);
router.put("/:id", authorize("ADMIN"), validate(connectedDeviceSchema), controller.updateConnectedDevice);
router.delete("/:id", authorize("ADMIN"), controller.deleteConnectedDevice);

export default router;

import express from "express";
import * as controller from "../controllers/dataSource.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../validators/user.validator.js";
import { dataSourceSchema } from "../validators/schemas.js";

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("ADMIN"), controller.getDataSources);
router.post("/", authorize("ADMIN"), validate(dataSourceSchema), controller.createDataSource);
router.get("/:id", authorize("ADMIN"), controller.getDataSourceById);
router.put("/:id", authorize("ADMIN"), validate(dataSourceSchema), controller.updateDataSource);
router.delete("/:id", authorize("ADMIN"), controller.deleteDataSource);

export default router;

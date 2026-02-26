import express from "express";
import * as controller from "../controllers/society.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/", controller.getSocieties);
router.get("/:id", controller.getSocietyById);
router.post("/", controller.createSociety);
router.put("/:id", controller.updateSociety);
router.delete("/:id", controller.deleteSociety);

export default router;

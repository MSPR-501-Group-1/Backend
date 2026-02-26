import express from "express";
import * as controller from "../controllers/ingredientsAte.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/", controller.getEntries);
router.get("/:id", controller.getEntryById);
router.post("/", controller.createEntry);
router.put("/:id", controller.updateEntry);
router.delete("/:id", controller.deleteEntry);

export default router;

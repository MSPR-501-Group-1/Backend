import express from "express";
import * as controller from "../controllers/history.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/", controller.getHistories);
router.get("/:id", controller.getHistoryById);
router.post("/", controller.createHistory);
router.delete("/:id", controller.deleteHistory);

export default router;

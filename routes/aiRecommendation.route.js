import express from "express";
import * as controller from "../controllers/aiRecommendation.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../validators/user.validator.js";
import { aiRecommendationSchema } from "../validators/schemas.js";

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("ADMIN"), controller.getAiRecommendations);
router.post("/", authorize("ADMIN"), validate(aiRecommendationSchema), controller.createAiRecommendation);
router.get("/:id", authorize("ADMIN"), controller.getAiRecommendationById);
router.put("/:id", authorize("ADMIN"), validate(aiRecommendationSchema), controller.updateAiRecommendation);
router.delete("/:id", authorize("ADMIN"), controller.deleteAiRecommendation);

export default router;

import express from "express";
import * as controller from "../controllers/dietRecommendation.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../validators/user.validator.js";
import { dietRecommendationSchema } from "../validators/schemas.js";

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("ADMIN"), controller.getDietRecommendations);
router.post("/", authorize("ADMIN"), validate(dietRecommendationSchema), controller.createDietRecommendation);
router.get("/:id", authorize("ADMIN"), controller.getDietRecommendationById);
router.put("/:id", authorize("ADMIN"), validate(dietRecommendationSchema), controller.updateDietRecommendation);
router.delete("/:id", authorize("ADMIN"), controller.deleteDietRecommendation);

export default router;

import express from "express";
import * as controller from "../controllers/foodDiary.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../validators/user.validator.js";
import { foodDiarySchema } from "../validators/schemas.js";

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("ADMIN"), controller.getFoodDiaryEntries);
router.post("/", authorize("ADMIN"), validate(foodDiarySchema), controller.createFoodDiaryEntry);
router.get("/:id", authorize("ADMIN"), controller.getFoodDiaryById);
router.put("/:id", authorize("ADMIN"), validate(foodDiarySchema), controller.updateFoodDiaryEntry);
router.delete("/:id", authorize("ADMIN"), controller.deleteFoodDiaryEntry);

export default router;

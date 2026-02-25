import express from "express";
import * as controller from "../controllers/food.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../validators/user.validator.js";
import { foodSchema } from "../validators/schemas.js";

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("ADMIN"), controller.getFoods);
router.post("/", authorize("ADMIN"), validate(foodSchema), controller.createFood);
router.get("/:id", authorize("ADMIN"), controller.getFoodById);
router.put("/:id", authorize("ADMIN"), validate(foodSchema), controller.updateFood);
router.delete("/:id", authorize("ADMIN"), controller.deleteFood);

export default router;

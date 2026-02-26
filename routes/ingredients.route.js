import express from "express";
import * as controller from "../controllers/ingredients.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/", controller.getIngredients);
router.get("/:id", controller.getIngredientById);
router.post("/", controller.createIngredient);
router.put("/:id", controller.updateIngredient);
router.delete("/:id", controller.deleteIngredient);

export default router;

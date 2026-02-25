import express from "express";
import * as controller from "../controllers/recipeIngredient.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../validators/user.validator.js";
import { recipeIngredientSchema } from "../validators/schemas.js";

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("ADMIN"), controller.getRecipeIngredients);
router.post("/", authorize("ADMIN"), validate(recipeIngredientSchema), controller.createRecipeIngredient);
router.get("/:id", authorize("ADMIN"), controller.getRecipeIngredientById);
router.put("/:id", authorize("ADMIN"), validate(recipeIngredientSchema), controller.updateRecipeIngredient);
router.delete("/:id", authorize("ADMIN"), controller.deleteRecipeIngredient);

export default router;

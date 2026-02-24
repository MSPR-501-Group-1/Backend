import express from "express";
import * as controller from "../controllers/recipe.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../validators/user.validator.js";
import { recipeSchema } from "../validators/schemas.js";

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("ADMIN"), controller.getRecipes);
router.post("/", authorize("ADMIN"), validate(recipeSchema), controller.createRecipe);
router.get("/:id", authorize("ADMIN"), controller.getRecipeById);
router.put("/:id", authorize("ADMIN"), validate(recipeSchema), controller.updateRecipe);
router.delete("/:id", authorize("ADMIN"), controller.deleteRecipe);

export default router;

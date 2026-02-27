import * as recipeService from "../../services/recipe.service.js";

export const getRecipes = async (req, res) => {
    try {
        const rows = await recipeService.getRecipes();
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Error getRecipes:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const getRecipeById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await recipeService.getRecipeById(id);
        if (!item) return res.status(404).json({ success: false, message: "Recette non trouvée" });
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        console.error("Error getRecipeById:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const createRecipe = async (req, res) => {
    try {
        const item = await recipeService.createRecipe(req.body);
        res.status(201).json({ success: true, message: "Recette créée", data: item });
    } catch (error) {
        console.error("Error createRecipe:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la création" });
    }
};

export const updateRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await recipeService.updateRecipe(id, req.body);
        if (!item) return res.status(404).json({ success: false, message: "Recette non trouvée" });
        res.status(200).json({ success: true, message: "Recette mise à jour", data: item });
    } catch (error) {
        console.error("Error updateRecipe:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const deleteRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await recipeService.deleteRecipe(id);
        if (!result) return res.status(404).json({ success: false, message: "Recette non trouvée" });
        res.status(200).json({ success: true, message: "Recette supprimée" });
    } catch (error) {
        console.error("Error deleteRecipe:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

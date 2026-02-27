import * as riService from "../../services/recipeIngredient.service.js";

export const getRecipeIngredients = async (req, res) => {
    try {
        const rows = await riService.getRecipeIngredients();
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Error getRecipeIngredients:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const getRecipeIngredientById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await riService.getRecipeIngredientById(id);
        if (!item) return res.status(404).json({ success: false, message: "Lien non trouvé" });
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        console.error("Error getRecipeIngredientById:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const createRecipeIngredient = async (req, res) => {
    try {
        const item = await riService.createRecipeIngredient(req.body);
        res.status(201).json({ success: true, message: "Lien créé", data: item });
    } catch (error) {
        console.error("Error createRecipeIngredient:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la création" });
    }
};

export const updateRecipeIngredient = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await riService.updateRecipeIngredient(id, req.body);
        if (!item) return res.status(404).json({ success: false, message: "Lien non trouvé" });
        res.status(200).json({ success: true, message: "Lien mis à jour", data: item });
    } catch (error) {
        console.error("Error updateRecipeIngredient:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const deleteRecipeIngredient = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await riService.deleteRecipeIngredient(id);
        if (!result) return res.status(404).json({ success: false, message: "Lien non trouvé" });
        res.status(200).json({ success: true, message: "Lien supprimé" });
    } catch (error) {
        console.error("Error deleteRecipeIngredient:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

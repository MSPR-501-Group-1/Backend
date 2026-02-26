import * as ingredientsService from "../services/ingredients.service.js";

export const getIngredients = async (req, res) => {
    try {
        const items = await ingredientsService.getIngredients();
        res.status(200).json({ success: true, data: items });
    } catch (error) {
        console.error("Erreur getIngredients:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la récupération des ingrédients" });
    }
};

export const getIngredientById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await ingredientsService.getIngredientById(id);
        if (!item) return res.status(404).json({ success: false, message: "Ingrédient non trouvé" });
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        console.error("Erreur getIngredientById:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la récupération de l'ingrédient" });
    }
};

export const createIngredient = async (req, res) => {
    try {
        const created = await ingredientsService.createIngredient(req.body);
        res.status(201).json({ success: true, message: "Ingrédient créé", data: created });
    } catch (error) {
        console.error("Erreur createIngredient:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la création de l'ingrédient" });
    }
};

export const updateIngredient = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await ingredientsService.updateIngredient(id, req.body);
        if (!updated) return res.status(404).json({ success: false, message: "Ingrédient non trouvé ou aucun champ à mettre à jour" });
        res.status(200).json({ success: true, message: "Ingrédient mis à jour", data: updated });
    } catch (error) {
        console.error("Erreur updateIngredient:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la mise à jour de l'ingrédient" });
    }
};

export const deleteIngredient = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await ingredientsService.deleteIngredient(id);
        if (!result) return res.status(404).json({ success: false, message: "Ingrédient non trouvé" });
        res.status(200).json({ success: true, message: "Ingrédient supprimé" });
    } catch (error) {
        console.error("Erreur deleteIngredient:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la suppression de l'ingrédient" });
    }
};

import * as foodService from "../services/food.service.js";

export const getFoods = async (req, res) => {
    try {
        const rows = await foodService.getFoods();
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Error getFoods:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const getFoodById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await foodService.getFoodById(id);
        if (!item) return res.status(404).json({ success: false, message: "Aliment non trouvé" });
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        console.error("Error getFoodById:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const createFood = async (req, res) => {
    try {
        const item = await foodService.createFood(req.body);
        res.status(201).json({ success: true, message: "Aliment créé", data: item });
    } catch (error) {
        console.error("Error createFood:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la création" });
    }
};

export const updateFood = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await foodService.updateFood(id, req.body);
        if (!item) return res.status(404).json({ success: false, message: "Aliment non trouvé" });
        res.status(200).json({ success: true, message: "Aliment mis à jour", data: item });
    } catch (error) {
        console.error("Error updateFood:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const deleteFood = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await foodService.deleteFood(id);
        if (!result) return res.status(404).json({ success: false, message: "Aliment non trouvé" });
        res.status(200).json({ success: true, message: "Aliment supprimé" });
    } catch (error) {
        console.error("Error deleteFood:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

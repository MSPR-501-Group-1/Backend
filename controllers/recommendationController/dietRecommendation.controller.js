import * as drService from "../../services/dietRecommendation.service.js";

export const getDietRecommendations = async (req, res) => {
    try {
        const rows = await drService.getDietRecommendations();
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Error getDietRecommendations:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const getDietRecommendationById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await drService.getDietRecommendationById(id);
        if (!item) return res.status(404).json({ success: false, message: "Recommandation non trouvée" });
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        console.error("Error getDietRecommendationById:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const createDietRecommendation = async (req, res) => {
    try {
        const item = await drService.createDietRecommendation(req.body);
        res.status(201).json({ success: true, message: "Recommandation créée", data: item });
    } catch (error) {
        console.error("Error createDietRecommendation:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la création" });
    }
};

export const updateDietRecommendation = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await drService.updateDietRecommendation(id, req.body);
        if (!item) return res.status(404).json({ success: false, message: "Recommandation non trouvée" });
        res.status(200).json({ success: true, message: "Recommandation mise à jour", data: item });
    } catch (error) {
        console.error("Error updateDietRecommendation:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const deleteDietRecommendation = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await drService.deleteDietRecommendation(id);
        if (!result) return res.status(404).json({ success: false, message: "Recommandation non trouvée" });
        res.status(200).json({ success: true, message: "Recommandation supprimée" });
    } catch (error) {
        console.error("Error deleteDietRecommendation:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

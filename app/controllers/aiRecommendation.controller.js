import * as aiService from "../services/aiRecommendation.service.js";

export const getAiRecommendations = async (req, res) => {
    try {
        const rows = await aiService.getAiRecommendations();
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Error getAiRecommendations:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const getAiRecommendationById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await aiService.getAiRecommendationById(id);
        if (!item) return res.status(404).json({ success: false, message: "Recommandation non trouvée" });
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        console.error("Error getAiRecommendationById:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const createAiRecommendation = async (req, res) => {
    try {
        const item = await aiService.createAiRecommendation(req.body);
        res.status(201).json({ success: true, message: "Recommandation créée", data: item });
    } catch (error) {
        console.error("Error createAiRecommendation:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la création" });
    }
};

export const updateAiRecommendation = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await aiService.updateAiRecommendation(id, req.body);
        if (!item) return res.status(404).json({ success: false, message: "Recommandation non trouvée" });
        res.status(200).json({ success: true, message: "Recommandation mise à jour", data: item });
    } catch (error) {
        console.error("Error updateAiRecommendation:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const deleteAiRecommendation = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await aiService.deleteAiRecommendation(id);
        if (!result) return res.status(404).json({ success: false, message: "Recommandation non trouvée" });
        res.status(200).json({ success: true, message: "Recommandation supprimée" });
    } catch (error) {
        console.error("Error deleteAiRecommendation:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

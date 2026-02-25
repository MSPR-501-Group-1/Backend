import * as umService from "../services/userMetrics.service.js";

export const getUserMetrics = async (req, res) => {
    try {
        const rows = await umService.getUserMetrics();
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Error getUserMetrics:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const getUserMetricById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await umService.getUserMetricById(id);
        if (!item) return res.status(404).json({ success: false, message: "Mesure non trouvée" });
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        console.error("Error getUserMetricById:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const createUserMetric = async (req, res) => {
    try {
        const item = await umService.createUserMetric(req.body);
        res.status(201).json({ success: true, message: "Mesure créée", data: item });
    } catch (error) {
        console.error("Error createUserMetric:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la création" });
    }
};

export const updateUserMetric = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await umService.updateUserMetric(id, req.body);
        if (!item) return res.status(404).json({ success: false, message: "Mesure non trouvée" });
        res.status(200).json({ success: true, message: "Mesure mise à jour", data: item });
    } catch (error) {
        console.error("Error updateUserMetric:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const deleteUserMetric = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await umService.deleteUserMetric(id);
        if (!result) return res.status(404).json({ success: false, message: "Mesure non trouvée" });
        res.status(200).json({ success: true, message: "Mesure supprimée" });
    } catch (error) {
        console.error("Error deleteUserMetric:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

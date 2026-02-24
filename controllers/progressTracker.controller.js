import * as ptService from "../services/progressTracker.service.js";

export const getProgressTrackers = async (req, res) => {
    try {
        const rows = await ptService.getProgressTrackers();
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Error getProgressTrackers:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const getProgressTrackerById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await ptService.getProgressTrackerById(id);
        if (!item) return res.status(404).json({ success: false, message: "Suivi non trouvé" });
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        console.error("Error getProgressTrackerById:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const createProgressTracker = async (req, res) => {
    try {
        const item = await ptService.createProgressTracker(req.body);
        res.status(201).json({ success: true, message: "Suivi créé", data: item });
    } catch (error) {
        console.error("Error createProgressTracker:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la création" });
    }
};

export const updateProgressTracker = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await ptService.updateProgressTracker(id, req.body);
        if (!item) return res.status(404).json({ success: false, message: "Suivi non trouvé" });
        res.status(200).json({ success: true, message: "Suivi mis à jour", data: item });
    } catch (error) {
        console.error("Error updateProgressTracker:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const deleteProgressTracker = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await ptService.deleteProgressTracker(id);
        if (!result) return res.status(404).json({ success: false, message: "Suivi non trouvé" });
        res.status(200).json({ success: true, message: "Suivi supprimé" });
    } catch (error) {
        console.error("Error deleteProgressTracker:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

import * as historyService from "../services/history.service.js";

export const getHistories = async (req, res) => {
    try {
        const rows = await historyService.getHistories();
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Erreur getHistories:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la récupération des histories" });
    }
};

export const getHistoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await historyService.getHistoryById(id);
        if (!item) return res.status(404).json({ success: false, message: "History non trouvé" });
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        console.error("Erreur getHistoryById:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la récupération de la history" });
    }
};

export const createHistory = async (req, res) => {
    try {
        const created = await historyService.createHistory();
        res.status(201).json({ success: true, message: "History créée", data: created });
    } catch (error) {
        console.error("Erreur createHistory:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la création de la history" });
    }
};

export const deleteHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await historyService.deleteHistory(id);
        if (!result) return res.status(404).json({ success: false, message: "History non trouvé" });
        res.status(200).json({ success: true, message: "History supprimé" });
    } catch (error) {
        console.error("Erreur deleteHistory:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la suppression de la history" });
    }
};

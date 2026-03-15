import * as sdService from "../../services/sessionDetail.service.js";

export const getSessionDetails = async (req, res) => {
    try {
        const rows = await sdService.getSessionDetails();
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Error getSessionDetails:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const getSessionDetailById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await sdService.getSessionDetailById(id);
        if (!item) return res.status(404).json({ success: false, message: "Détail non trouvé" });
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        console.error("Error getSessionDetailById:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const createSessionDetail = async (req, res) => {
    try {
        const item = await sdService.createSessionDetail(req.body);
        res.status(201).json({ success: true, message: "Détail créé", data: item });
    } catch (error) {
        console.error("Error createSessionDetail:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la création" });
    }
};

export const updateSessionDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await sdService.updateSessionDetail(id, req.body);
        if (!item) return res.status(404).json({ success: false, message: "Détail non trouvé" });
        res.status(200).json({ success: true, message: "Détail mis à jour", data: item });
    } catch (error) {
        console.error("Error updateSessionDetail:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const deleteSessionDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await sdService.deleteSessionDetail(id);
        if (!result) return res.status(404).json({ success: false, message: "Détail non trouvé" });
        res.status(200).json({ success: true, message: "Détail supprimé" });
    } catch (error) {
        console.error("Error deleteSessionDetail:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

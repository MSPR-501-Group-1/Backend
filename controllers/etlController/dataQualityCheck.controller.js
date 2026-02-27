import * as dqService from "../../services/dataQualityCheck.service.js";

export const getDataQualityChecks = async (req, res) => {
    try {
        const rows = await dqService.getDataQualityChecks();
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Error getDataQualityChecks:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const getDataQualityCheckById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await dqService.getDataQualityCheckById(id);
        if (!item) return res.status(404).json({ success: false, message: "Contrôle non trouvé" });
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        console.error("Error getDataQualityCheckById:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const createDataQualityCheck = async (req, res) => {
    try {
        const item = await dqService.createDataQualityCheck(req.body);
        res.status(201).json({ success: true, message: "Contrôle créé", data: item });
    } catch (error) {
        console.error("Error createDataQualityCheck:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la création" });
    }
};

export const updateDataQualityCheck = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await dqService.updateDataQualityCheck(id, req.body);
        if (!item) return res.status(404).json({ success: false, message: "Contrôle non trouvé" });
        res.status(200).json({ success: true, message: "Contrôle mis à jour", data: item });
    } catch (error) {
        console.error("Error updateDataQualityCheck:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const deleteDataQualityCheck = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await dqService.deleteDataQualityCheck(id);
        if (!result) return res.status(404).json({ success: false, message: "Contrôle non trouvé" });
        res.status(200).json({ success: true, message: "Contrôle supprimé" });
    } catch (error) {
        console.error("Error deleteDataQualityCheck:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

import * as daService from "../services/dataAnomaly.service.js";

export const getDataAnomalies = async (req, res) => {
    try {
        const rows = await daService.getDataAnomalies();
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Error getDataAnomalies:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const getDataAnomalyById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await daService.getDataAnomalyById(id);
        if (!item) return res.status(404).json({ success: false, message: "Anomalie non trouvée" });
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        console.error("Error getDataAnomalyById:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const createDataAnomaly = async (req, res) => {
    try {
        const item = await daService.createDataAnomaly(req.body);
        res.status(201).json({ success: true, message: "Anomalie créée", data: item });
    } catch (error) {
        console.error("Error createDataAnomaly:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la création" });
    }
};

export const updateDataAnomaly = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await daService.updateDataAnomaly(id, req.body);
        if (!item) return res.status(404).json({ success: false, message: "Anomalie non trouvée" });
        res.status(200).json({ success: true, message: "Anomalie mise à jour", data: item });
    } catch (error) {
        console.error("Error updateDataAnomaly:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const deleteDataAnomaly = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await daService.deleteDataAnomaly(id);
        if (!result) return res.status(404).json({ success: false, message: "Anomalie non trouvée" });
        res.status(200).json({ success: true, message: "Anomalie supprimée" });
    } catch (error) {
        console.error("Error deleteDataAnomaly:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

import * as dsService from "../services/dataSource.service.js";

export const getDataSources = async (req, res) => {
    try {
        const rows = await dsService.getDataSources();
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Error getDataSources:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const getDataSourceById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await dsService.getDataSourceById(id);
        if (!item) return res.status(404).json({ success: false, message: "Source non trouvée" });
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        console.error("Error getDataSourceById:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const createDataSource = async (req, res) => {
    try {
        const item = await dsService.createDataSource(req.body);
        res.status(201).json({ success: true, message: "Source créée", data: item });
    } catch (error) {
        console.error("Error createDataSource:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la création" });
    }
};

export const updateDataSource = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await dsService.updateDataSource(id, req.body);
        if (!item) return res.status(404).json({ success: false, message: "Source non trouvée" });
        res.status(200).json({ success: true, message: "Source mise à jour", data: item });
    } catch (error) {
        console.error("Error updateDataSource:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const deleteDataSource = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await dsService.deleteDataSource(id);
        if (!result) return res.status(404).json({ success: false, message: "Source non trouvée" });
        res.status(200).json({ success: true, message: "Source supprimée" });
    } catch (error) {
        console.error("Error deleteDataSource:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

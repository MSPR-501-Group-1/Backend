import * as societyService from "../services/society.service.js";

export const getSocieties = async (req, res) => {
    try {
        const rows = await societyService.getSocieties();
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Erreur getSocieties:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la récupération des sociétés" });
    }
};

export const getSocietyById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await societyService.getSocietyById(id);
        if (!item) return res.status(404).json({ success: false, message: "Société non trouvée" });
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        console.error("Erreur getSocietyById:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la récupération de la société" });
    }
};

export const createSociety = async (req, res) => {
    try {
        const created = await societyService.createSociety(req.body);
        res.status(201).json({ success: true, message: "Société créée", data: created });
    } catch (error) {
        console.error("Erreur createSociety:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la création de la société" });
    }
};

export const updateSociety = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await societyService.updateSociety(id, req.body);
        if (!updated) return res.status(404).json({ success: false, message: "Société non trouvée ou aucun champ à mettre à jour" });
        res.status(200).json({ success: true, message: "Société mise à jour", data: updated });
    } catch (error) {
        console.error("Erreur updateSociety:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la mise à jour de la société" });
    }
};

export const deleteSociety = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await societyService.deleteSociety(id);
        if (!result) return res.status(404).json({ success: false, message: "Société non trouvée" });
        res.status(200).json({ success: true, message: "Société supprimée" });
    } catch (error) {
        console.error("Erreur deleteSociety:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la suppression de la société" });
    }
};

import * as entriesService from "../../services/ingredientsAte.service.js";

export const getEntries = async (req, res) => {
    try {
        const rows = await entriesService.getEntries();
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Erreur getEntries:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la récupération des entrées" });
    }
};

export const getEntryById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await entriesService.getEntryById(id);
        if (!item) return res.status(404).json({ success: false, message: "Entrée non trouvée" });
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        console.error("Erreur getEntryById:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la récupération de l'entrée" });
    }
};

export const createEntry = async (req, res) => {
    try {
        const created = await entriesService.createEntry(req.body);
        res.status(201).json({ success: true, message: "Entrée créée", data: created });
    } catch (error) {
        console.error("Erreur createEntry:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la création de l'entrée" });
    }
};

export const updateEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await entriesService.updateEntry(id, req.body);
        if (!updated) return res.status(404).json({ success: false, message: "Entrée non trouvée ou aucun champ à mettre à jour" });
        res.status(200).json({ success: true, message: "Entrée mise à jour", data: updated });
    } catch (error) {
        console.error("Erreur updateEntry:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la mise à jour de l'entrée" });
    }
};

export const deleteEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await entriesService.deleteEntry(id);
        if (!result) return res.status(404).json({ success: false, message: "Entrée non trouvée" });
        res.status(200).json({ success: true, message: "Entrée supprimée" });
    } catch (error) {
        console.error("Erreur deleteEntry:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la suppression de l'entrée" });
    }
};

import * as atService from "../../services/activityType.service.js";

export const getActivityTypes = async (req, res) => {
    try {
        const rows = await atService.getActivityTypes();
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Error getActivityTypes:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const getActivityTypeById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await atService.getActivityTypeById(id);
        if (!item) return res.status(404).json({ success: false, message: "Type d'activité non trouvé" });
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        console.error("Error getActivityTypeById:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const createActivityType = async (req, res) => {
    try {
        const item = await atService.createActivityType(req.body);
        res.status(201).json({ success: true, message: "Type d'activité créé", data: item });
    } catch (error) {
        console.error("Error createActivityType:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la création" });
    }
};

export const updateActivityType = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await atService.updateActivityType(id, req.body);
        if (!item) return res.status(404).json({ success: false, message: "Type d'activité non trouvé" });
        res.status(200).json({ success: true, message: "Type d'activité mis à jour", data: item });
    } catch (error) {
        console.error("Error updateActivityType:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const deleteActivityType = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await atService.deleteActivityType(id);
        if (!result) return res.status(404).json({ success: false, message: "Type d'activité non trouvé" });
        res.status(200).json({ success: true, message: "Type d'activité supprimé" });
    } catch (error) {
        console.error("Error deleteActivityType:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

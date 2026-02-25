import * as hgService from "../services/healthGoal.service.js";

export const getHealthGoals = async (req, res) => {
    try {
        const rows = await hgService.getHealthGoals();
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Error getHealthGoals:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const getHealthGoalById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await hgService.getHealthGoalById(id);
        if (!item) return res.status(404).json({ success: false, message: "Objectif non trouvé" });
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        console.error("Error getHealthGoalById:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const createHealthGoal = async (req, res) => {
    try {
        const item = await hgService.createHealthGoal(req.body);
        res.status(201).json({ success: true, message: "Objectif créé", data: item });
    } catch (error) {
        console.error("Error createHealthGoal:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la création" });
    }
};

export const updateHealthGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await hgService.updateHealthGoal(id, req.body);
        if (!item) return res.status(404).json({ success: false, message: "Objectif non trouvé" });
        res.status(200).json({ success: true, message: "Objectif mis à jour", data: item });
    } catch (error) {
        console.error("Error updateHealthGoal:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const deleteHealthGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await hgService.deleteHealthGoal(id);
        if (!result) return res.status(404).json({ success: false, message: "Objectif non trouvé" });
        res.status(200).json({ success: true, message: "Objectif supprimé" });
    } catch (error) {
        console.error("Error deleteHealthGoal:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

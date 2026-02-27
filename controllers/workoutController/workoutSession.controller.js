import * as wsService from "../../services/workoutSession.service.js";

export const getWorkoutSessions = async (req, res) => {
    try {
        const rows = await wsService.getWorkoutSessions();
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Error getWorkoutSessions:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const getWorkoutSessionById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await wsService.getWorkoutSessionById(id);
        if (!item) return res.status(404).json({ success: false, message: "Session non trouvée" });
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        console.error("Error getWorkoutSessionById:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const createWorkoutSession = async (req, res) => {
    try {
        const item = await wsService.createWorkoutSession(req.body);
        res.status(201).json({ success: true, message: "Session créée", data: item });
    } catch (error) {
        console.error("Error createWorkoutSession:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la création" });
    }
};

export const updateWorkoutSession = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await wsService.updateWorkoutSession(id, req.body);
        if (!item) return res.status(404).json({ success: false, message: "Session non trouvée" });
        res.status(200).json({ success: true, message: "Session mise à jour", data: item });
    } catch (error) {
        console.error("Error updateWorkoutSession:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const deleteWorkoutSession = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await wsService.deleteWorkoutSession(id);
        if (!result) return res.status(404).json({ success: false, message: "Session non trouvée" });
        res.status(200).json({ success: true, message: "Session supprimée" });
    } catch (error) {
        console.error("Error deleteWorkoutSession:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

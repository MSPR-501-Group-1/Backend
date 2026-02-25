import * as exService from "../services/exercise.service.js";

export const getExercises = async (req, res) => {
    try {
        const rows = await exService.getExercises();
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Error getExercises:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const getExerciseById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await exService.getExerciseById(id);
        if (!item) return res.status(404).json({ success: false, message: "Exercice non trouvé" });
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        console.error("Error getExerciseById:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const createExercise = async (req, res) => {
    try {
        const item = await exService.createExercise(req.body);
        res.status(201).json({ success: true, message: "Exercice créé", data: item });
    } catch (error) {
        console.error("Error createExercise:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la création" });
    }
};

export const updateExercise = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await exService.updateExercise(id, req.body);
        if (!item) return res.status(404).json({ success: false, message: "Exercice non trouvé" });
        res.status(200).json({ success: true, message: "Exercice mis à jour", data: item });
    } catch (error) {
        console.error("Error updateExercise:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const deleteExercise = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await exService.deleteExercise(id);
        if (!result) return res.status(404).json({ success: false, message: "Exercice non trouvé" });
        res.status(200).json({ success: true, message: "Exercice supprimé" });
    } catch (error) {
        console.error("Error deleteExercise:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

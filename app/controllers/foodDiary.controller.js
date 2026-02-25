import * as fdService from "../services/foodDiary.service.js";

export const getFoodDiaryEntries = async (req, res) => {
    try {
        const rows = await fdService.getFoodDiaryEntries();
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Error getFoodDiaryEntries:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const getFoodDiaryById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await fdService.getFoodDiaryById(id);
        if (!item) return res.status(404).json({ success: false, message: "Entrée non trouvée" });
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        console.error("Error getFoodDiaryById:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const createFoodDiaryEntry = async (req, res) => {
    try {
        const item = await fdService.createFoodDiaryEntry(req.body);
        res.status(201).json({ success: true, message: "Entrée créée", data: item });
    } catch (error) {
        console.error("Error createFoodDiaryEntry:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la création" });
    }
};

export const updateFoodDiaryEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await fdService.updateFoodDiaryEntry(id, req.body);
        if (!item) return res.status(404).json({ success: false, message: "Entrée non trouvée" });
        res.status(200).json({ success: true, message: "Entrée mise à jour", data: item });
    } catch (error) {
        console.error("Error updateFoodDiaryEntry:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const deleteFoodDiaryEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await fdService.deleteFoodDiaryEntry(id);
        if (!result) return res.status(404).json({ success: false, message: "Entrée non trouvée" });
        res.status(200).json({ success: true, message: "Entrée supprimée" });
    } catch (error) {
        console.error("Error deleteFoodDiaryEntry:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

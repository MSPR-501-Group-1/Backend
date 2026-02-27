import * as bmService from "../../services/biometricMeasure.service.js";

export const getBiometricMeasures = async (req, res) => {
    try {
        const rows = await bmService.getBiometricMeasures();
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Error getBiometricMeasures:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const getBiometricMeasureById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await bmService.getBiometricMeasureById(id);
        if (!item) return res.status(404).json({ success: false, message: "Mesure non trouvée" });
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        console.error("Error getBiometricMeasureById:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const createBiometricMeasure = async (req, res) => {
    try {
        const item = await bmService.createBiometricMeasure(req.body);
        res.status(201).json({ success: true, message: "Mesure créée", data: item });
    } catch (error) {
        console.error("Error createBiometricMeasure:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la création" });
    }
};

export const updateBiometricMeasure = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await bmService.updateBiometricMeasure(id, req.body);
        if (!item) return res.status(404).json({ success: false, message: "Mesure non trouvée" });
        res.status(200).json({ success: true, message: "Mesure mise à jour", data: item });
    } catch (error) {
        console.error("Error updateBiometricMeasure:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const deleteBiometricMeasure = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await bmService.deleteBiometricMeasure(id);
        if (!result) return res.status(404).json({ success: false, message: "Mesure non trouvée" });
        res.status(200).json({ success: true, message: "Mesure supprimée" });
    } catch (error) {
        console.error("Error deleteBiometricMeasure:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

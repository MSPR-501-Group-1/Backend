import * as upService from "../services/userProfile.service.js";

export const getUserProfiles = async (req, res) => {
    try {
        const rows = await upService.getUserProfiles();
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Error getUserProfiles:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const getUserProfileById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await upService.getUserProfileById(id);
        if (!item) return res.status(404).json({ success: false, message: "Profil non trouvé" });
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        console.error("Error getUserProfileById:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const createUserProfile = async (req, res) => {
    try {
        const item = await upService.createUserProfile(req.body);
        res.status(201).json({ success: true, message: "Profil créé", data: item });
    } catch (error) {
        console.error("Error createUserProfile:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la création" });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await upService.updateUserProfile(id, req.body);
        if (!item) return res.status(404).json({ success: false, message: "Profil non trouvé" });
        res.status(200).json({ success: true, message: "Profil mis à jour", data: item });
    } catch (error) {
        console.error("Error updateUserProfile:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const deleteUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await upService.deleteUserProfile(id);
        if (!result) return res.status(404).json({ success: false, message: "Profil non trouvé" });
        res.status(200).json({ success: true, message: "Profil supprimé" });
    } catch (error) {
        console.error("Error deleteUserProfile:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

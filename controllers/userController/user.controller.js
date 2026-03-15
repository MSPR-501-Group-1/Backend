import * as userService from "../../services/user.service.js";
import * as userProfileService from "../../services/userProfile.service.js";

// Get all users
export const getUsers = async (req, res) => {
    try {
        const result = await userService.getUsers();

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error("Erreur getUsers:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des utilisateurs"
        });
    }
};

// Get a user by it's id
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userService.getUserById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Utilisateur non trouvé"
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error("Erreur getUserById:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération de l'utilisateur"
        });
    }
};

// Create a user with a body
export const createUser = async (req, res) => {
    try {
        const user = await userService.createUser(req.body);

        res.status(201).json({
            success: true,
            message: "Utilisateur créé avec succès",
            data: user
        });

    } catch (error) {
        if (error.message === "EMAIL_EXISTS") {
            return res.status(409).json({
                success: false,
                message: "Cet email est déjà utilisé"
            });
        }
        console.error("Erreur createUser:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la création de l'utilisateur"
        });
    }
};

// Update a user by it's id
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userService.updateUser(id, req.body);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Utilisateur non trouvé"
            });
        }

        res.status(200).json({
            success: true,
            message: "Utilisateur mis à jour avec succès",
            data: user
        });
    } catch (error) {
        if (error.message === "EMAIL_EXISTS") {
            return res.status(409).json({
                success: false,
                message: "Cet email est déjà utilisé"
            });
        }
        if (error.message === "NO_FIELDS_TO_UPDATE") {
            return res.status(400).json({
                success: false,
                message: "Aucun champ à mettre à jour"
            });
        }
        console.error("Erreur updateUser:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la mise à jour de l'utilisateur"
        });
    }
};

// Soft delete a user by it's id
export const softDeleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await userService.softDeleteUser(id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Utilisateur non trouvé"
            });
        }

        res.status(200).json({
            success: true,
            message: "Utilisateur désactivé avec succès"
        });
    } catch (error) {
        console.error("Erreur softDeleteUser :", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la suppression de l'utilisateur"
        });
    }
};

// Hard delete a user by it's id
export const hardDeleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await userService.hardDeleteUser(id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Utilisateur non trouvé"
            });
        }

        res.status(200).json({
            success: true,
            message: "Utilisateur supprimé définitivement"
        });
    } catch (error) {
        console.error("Erreur hardDeleteUser:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la suppression définitive"
        });
    }
};

// Change user's password (owner or admin)
export const changePassword = async (req, res) => {
    try {
        const { id } = req.params;

        // accept both camelCase and snake_case from request body
        const currentPassword = req.body.currentPassword || req.body.current_password;
        const newPassword = req.body.newPassword || req.body.new_password;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "Champs de mot de passe manquants" });
        }

        // userService will throw errors for not found / invalid password
        await userService.changePassword(id, currentPassword, newPassword);

        res.status(200).json({ success: true, message: "Mot de passe changé avec succès" });
    } catch (error) {
        if (error.message === "USER_NOT_FOUND") {
            return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
        }
        if (error.message === "INVALID_PASSWORD") {
            return res.status(400).json({ success: false, message: "Mot de passe actuel invalide" });
        }
        console.error("Erreur changePassword:", error);
        res.status(500).json({ success: false, message: "Erreur lors du changement de mot de passe" });
    }
};
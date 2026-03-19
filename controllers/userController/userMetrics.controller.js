import * as userMetricsService from "../../services/userService/userMetrics.service.js";

// Get all users Metrics
export const getAllUsersMetrics = async (req, res) => {
    try {
        // Récupérer les métriques de tous les utilisateurs
        const result = await userMetricsService.getAllUsersMetrics();

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error("Erreur getAllUsersMetrics:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des metrics des utilisateurs"
        });
    }
};
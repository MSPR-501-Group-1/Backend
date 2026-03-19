import * as healthService from "../../services/systemService/health.service.js";

export const getHealth = async (req, res) => {
    try {
        const health = await healthService.getHealthStatus();

        return res.status(200).json({
            success: true,
            message: "Service operationnel",
            data: health
        });
    } catch (error) {
        console.error("Erreur getHealth:", error);

        return res.status(503).json({
            success: false,
            message: "Service indisponible"
        });
    }
};

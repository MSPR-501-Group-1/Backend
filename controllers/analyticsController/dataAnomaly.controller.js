import * as dataAnomalyService from "../../services/analyticsService/dataAnomaly.service.js";

const sendError = (res, error, fallbackMessage) => {
    const statusCode = Number.isInteger(error?.status) ? error.status : 500;

    return res.status(statusCode).json({
        success: false,
        message: error?.message || fallbackMessage,
        ...(error?.details !== undefined ? { details: error.details } : {}),
    });
};

export const getAnomalies = async (req, res) => {
    try {
        const data = await dataAnomalyService.getAnomalies(req.query);

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("Erreur getAnomalies:", error);
        return sendError(res, error, "Erreur lors de la recuperation des anomalies.");
    }
};

export const correctAnomaly = async (req, res) => {
    try {
        const data = await dataAnomalyService.correctAnomaly({
            anomalyId: req.params.id,
            resolutionAction: req.body?.resolution_action,
            resolvedBy: req.body?.resolved_by,
            requesterUserId: req.user?.user_id,
        });

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("Erreur correctAnomaly:", error);
        return sendError(res, error, "Erreur lors de la correction de l'anomalie.");
    }
};

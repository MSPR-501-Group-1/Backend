import * as businessKpiService from "../../services/analyticsService/businessKpi.service.js";

export const getBusinessKpis = async (req, res) => {
    try {
        const { range } = req.query;
        const data = await businessKpiService.getBusinessKpis(range);

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("Erreur getBusinessKpis:", error);

        return res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des KPIs business",
        });
    }
};

export const getNutritionAnalytics = async (req, res) => {
    try {
        const { range } = req.query;
        const data = await businessKpiService.getNutritionAnalytics(range);

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("Erreur getNutritionAnalytics:", error);

        return res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des analytics nutrition",
        });
    }
};

export const getBiometricAnalytics = async (req, res) => {
    try {
        const { range } = req.query;
        const data = await businessKpiService.getBiometricAnalytics(range);

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("Erreur getBiometricAnalytics:", error);

        return res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des analytics biométriques",
        });
    }
};

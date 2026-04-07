import * as etlService from "../../services/etlService/etl.service.js";

// Get all etl execution with their status and info (Ydatas / datas)
export const getEtlExecutions = async (req, res) => {
    try {
        const result = await etlService.getEtlExecutions();

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error("Erreur getEtlExecutions:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des exécutions ETL"
        });
    }
};

// Get an etl pipeline batch by it's id
export const getEtlById = async (req, res) => {
    try {
        const { id } = req.params;
        const etl = await etlService.getEtlById(id);

        if (!etl) {
            return res.status(404).json({
                success: false,
                message: "ETL non trouvé"
            });
        }

        res.status(200).json({
            success: true,
            data: etl
        });
    } catch (error) {
        console.error("Erreur getEtlById:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération de l'ETL"
        });
    }
};

// Launch an etl pipeline
export const launchEtlPipeline = async (req, res) => {
    try {
        const { pipeline } = req.params;
        const result = await etlService.launchEtlPipeline(pipeline);

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error("Erreur launchEtlPipeline:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors du lancement de la pipeline ETL"
        });
    }
};

// Push ETL data to database
export const pushEtlData = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await etlService.pushEtlData(id);

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error("Erreur pushEtlData:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors du push des données de la pipeline ETL"
        });
    }
};

// Mark ETL execution as loaded after successful validation
export const markEtlAsLoaded = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await etlService.markEtlAsLoaded(id);

        res.status(200).json({
            success: true,
            data: result,
            message: "Exécution ETL marquée comme chargée"
        });
    } catch (error) {
        console.error("Erreur markEtlAsLoaded:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la mise à jour du statut de l'ETL"
        });
    }
};

// Mark ETL execution as rejected
export const markEtlAsRejected = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await etlService.markEtlAsRejected(id);

        res.status(200).json({
            success: true,
            data: result,
            message: "Exécution ETL marquée comme rejetée"
        });
    } catch (error) {
        console.error("Erreur markEtlAsRejected:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la mise à jour du statut de l'ETL"
        });
    }
};

// Delete an ETL execution
export const deleteEtlExecution = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await etlService.deleteEtlExecution(id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Exécution ETL non trouvée"
            });
        }

        res.status(200).json({
            success: true,
            data: result,
            message: "Exécution ETL supprimée avec succès"
        });
    } catch (error) {
        console.error("Erreur deleteEtlExecution:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la suppression de l'exécution ETL"
        });
    }
};
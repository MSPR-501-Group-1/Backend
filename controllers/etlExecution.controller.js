import * as etlService from "../services/etlExecution.service.js";

export const getEtlExecutions = async (req, res) => {
    try {
        const rows = await etlService.getEtlExecutions();
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Error getEtlExecutions:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const getEtlExecutionById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await etlService.getEtlExecutionById(id);
        if (!item) return res.status(404).json({ success: false, message: "Exécution non trouvée" });
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        console.error("Error getEtlExecutionById:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const createEtlExecution = async (req, res) => {
    try {
        const item = await etlService.createEtlExecution(req.body);
        res.status(201).json({ success: true, message: "Exécution créée", data: item });
    } catch (error) {
        console.error("Error createEtlExecution:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la création" });
    }
};

export const updateEtlExecution = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await etlService.updateEtlExecution(id, req.body);
        if (!item) return res.status(404).json({ success: false, message: "Exécution non trouvée" });
        res.status(200).json({ success: true, message: "Exécution mise à jour", data: item });
    } catch (error) {
        console.error("Error updateEtlExecution:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const deleteEtlExecution = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await etlService.deleteEtlExecution(id);
        if (!result) return res.status(404).json({ success: false, message: "Exécution non trouvée" });
        res.status(200).json({ success: true, message: "Exécution supprimée" });
    } catch (error) {
        console.error("Error deleteEtlExecution:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

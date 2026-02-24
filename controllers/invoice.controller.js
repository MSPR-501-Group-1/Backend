import * as invoiceService from "../services/invoice.service.js";

export const getInvoices = async (req, res) => {
    try {
        const result = await invoiceService.getInvoices();
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error("Error getInvoices:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const getInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const inv = await invoiceService.getInvoiceById(id);
        if (!inv) return res.status(404).json({ success: false, message: "Facture non trouvée" });
        res.status(200).json({ success: true, data: inv });
    } catch (error) {
        console.error("Error getInvoiceById:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const createInvoice = async (req, res) => {
    try {
        const inv = await invoiceService.createInvoice(req.body);
        res.status(201).json({ success: true, message: "Facture créée", data: inv });
    } catch (error) {
        console.error("Error createInvoice:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la création" });
    }
};

export const updateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const inv = await invoiceService.updateInvoice(id, req.body);
        if (!inv) return res.status(404).json({ success: false, message: "Facture non trouvée" });
        res.status(200).json({ success: true, message: "Facture mise à jour", data: inv });
    } catch (error) {
        console.error("Error updateInvoice:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const deleteInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await invoiceService.deleteInvoice(id);
        if (!result) return res.status(404).json({ success: false, message: "Facture non trouvée" });
        res.status(200).json({ success: true, message: "Facture supprimée" });
    } catch (error) {
        console.error("Error deleteInvoice:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

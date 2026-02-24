import * as paymentService from "../services/payment.service.js";

export const getPayments = async (req, res) => {
    try {
        const result = await paymentService.getPayments();
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error("Error getPayments:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;
        const p = await paymentService.getPaymentById(id);
        if (!p) return res.status(404).json({ success: false, message: "Transaction non trouvée" });
        res.status(200).json({ success: true, data: p });
    } catch (error) {
        console.error("Error getPaymentById:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const createPayment = async (req, res) => {
    try {
        const p = await paymentService.createPayment(req.body);
        res.status(201).json({ success: true, message: "Transaction créée", data: p });
    } catch (error) {
        console.error("Error createPayment:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la création" });
    }
};

export const updatePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const p = await paymentService.updatePayment(id, req.body);
        if (!p) return res.status(404).json({ success: false, message: "Transaction non trouvée" });
        res.status(200).json({ success: true, message: "Transaction mise à jour", data: p });
    } catch (error) {
        console.error("Error updatePayment:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const deletePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await paymentService.deletePayment(id);
        if (!result) return res.status(404).json({ success: false, message: "Transaction non trouvée" });
        res.status(200).json({ success: true, message: "Transaction supprimée" });
    } catch (error) {
        console.error("Error deletePayment:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

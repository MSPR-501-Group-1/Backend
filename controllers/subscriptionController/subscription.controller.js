import * as subscriptionService from "../../services/subscription.service.js";

export const getSubscriptions = async (req, res) => {
    try {
        const result = await subscriptionService.getSubscriptions();
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error("Error getSubscriptions:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la récupération des abonnements" });
    }
};

export const getSubscriptionById = async (req, res) => {
    try {
        const { id } = req.params;
        const sub = await subscriptionService.getSubscriptionById(id);
        if (!sub) return res.status(404).json({ success: false, message: "Abonnement non trouvé" });
        res.status(200).json({ success: true, data: sub });
    } catch (error) {
        console.error("Error getSubscriptionById:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const createSubscription = async (req, res) => {
    try {
        const sub = await subscriptionService.createSubscription(req.body);
        res.status(201).json({ success: true, message: "Abonnement créé", data: sub });
    } catch (error) {
        console.error("Error createSubscription:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la création" });
    }
};

export const updateSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const sub = await subscriptionService.updateSubscription(id, req.body);
        if (!sub) return res.status(404).json({ success: false, message: "Abonnement non trouvé" });
        res.status(200).json({ success: true, message: "Abonnement mis à jour", data: sub });
    } catch (error) {
        console.error("Error updateSubscription:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const deleteSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await subscriptionService.deleteSubscription(id);
        if (!result) return res.status(404).json({ success: false, message: "Abonnement non trouvé" });
        res.status(200).json({ success: true, message: "Abonnement supprimé" });
    } catch (error) {
        console.error("Error deleteSubscription:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

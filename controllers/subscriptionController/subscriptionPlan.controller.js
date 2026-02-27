import * as subscriptionPlanService from "../../services/subscription.service.js";

// Get all subscription plans
// Get all subscription plans
export const getSubscriptionPlans = async (req, res) => {
    try {
        const result = await subscriptionPlanService.getSubscriptionPlans();
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error("Error getSubscriptionPlans:", error);
        res.status(500).json({ success: false, message: "Error getting subscription plans" });
    }
};

// Get one by id
export const getSubscriptionPlanById = async (req, res) => {
    try {
        const { id } = req.params;
        const plan = await subscriptionPlanService.getSubscriptionPlanById(id);
        if (!plan) return res.status(404).json({ success: false, message: "Plan non trouvé" });
        res.status(200).json({ success: true, data: plan });
    } catch (error) {
        console.error("Error getSubscriptionPlanById:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la récupération du plan" });
    }
};

// Create
export const createSubscriptionPlan = async (req, res) => {
    try {
        const plan = await subscriptionPlanService.createSubscriptionPlan(req.body);
        res.status(201).json({ success: true, message: "Plan créé", data: plan });
    } catch (error) {
        console.error("Error createSubscriptionPlan:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la création du plan" });
    }
};

// Update
export const updateSubscriptionPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const plan = await subscriptionPlanService.updateSubscriptionPlan(id, req.body);
        if (!plan) return res.status(404).json({ success: false, message: "Plan non trouvé" });
        res.status(200).json({ success: true, message: "Plan mis à jour", data: plan });
    } catch (error) {
        console.error("Error updateSubscriptionPlan:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la mise à jour du plan" });
    }
};

// Delete
export const deleteSubscriptionPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await subscriptionPlanService.deleteSubscriptionPlan(id);
        if (!result) return res.status(404).json({ success: false, message: "Plan non trouvé" });
        res.status(200).json({ success: true, message: "Plan supprimé" });
    } catch (error) {
        console.error("Error deleteSubscriptionPlan:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la suppression du plan" });
    }
};
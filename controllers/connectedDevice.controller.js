import * as cdService from "../services/connectedDevice.service.js";

export const getConnectedDevices = async (req, res) => {
    try {
        const rows = await cdService.getConnectedDevices();
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Error getConnectedDevices:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const getConnectedDeviceById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await cdService.getConnectedDeviceById(id);
        if (!item) return res.status(404).json({ success: false, message: "Appareil non trouvé" });
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        console.error("Error getConnectedDeviceById:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const createConnectedDevice = async (req, res) => {
    try {
        const item = await cdService.createConnectedDevice(req.body);
        res.status(201).json({ success: true, message: "Appareil créé", data: item });
    } catch (error) {
        console.error("Error createConnectedDevice:", error);
        res.status(500).json({ success: false, message: "Erreur lors de la création" });
    }
};

export const updateConnectedDevice = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await cdService.updateConnectedDevice(id, req.body);
        if (!item) return res.status(404).json({ success: false, message: "Appareil non trouvé" });
        res.status(200).json({ success: true, message: "Appareil mis à jour", data: item });
    } catch (error) {
        console.error("Error updateConnectedDevice:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

export const deleteConnectedDevice = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await cdService.deleteConnectedDevice(id);
        if (!result) return res.status(404).json({ success: false, message: "Appareil non trouvé" });
        res.status(200).json({ success: true, message: "Appareil supprimé" });
    } catch (error) {
        console.error("Error deleteConnectedDevice:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

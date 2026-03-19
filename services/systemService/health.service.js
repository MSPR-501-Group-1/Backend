import { db } from "../../db.js";

export const getHealthStatus = async () => {
    await db.query("SELECT 1");

    return {
        service: "backend",
        database: "up",
        timestamp: new Date().toISOString(),
        uptime_seconds: Math.floor(process.uptime())
    };
};

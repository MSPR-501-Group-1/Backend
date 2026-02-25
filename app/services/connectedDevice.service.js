import { db } from "../db.js";
import { v4 as uuidv4 } from "uuid";

export const getConnectedDevices = async () => {
    const result = await db.query(`
        SELECT device_id, user_id, device_name, device_type, last_sync, is_active
        FROM connected_device
    `);
    return result.rows;
};

export const getConnectedDeviceById = async (id) => {
    const result = await db.query(
        `SELECT device_id, user_id, device_name, device_type, last_sync, is_active FROM connected_device WHERE device_id = $1`,
        [id]
    );
    return result.rows[0] || null;
};

export const createConnectedDevice = async (data) => {
    const { user_id, device_name, device_type, last_sync, is_active } = data;
    const device_id = uuidv4();
    const result = await db.query(
        `INSERT INTO connected_device (device_id, user_id, device_name, device_type, last_sync, is_active)
         VALUES ($1,$2,$3,$4,$5,$6)
         RETURNING device_id, user_id, device_name, device_type, last_sync, is_active`,
        [device_id, user_id, device_name || null, device_type || null, last_sync || null, is_active !== false]
    );
    return result.rows[0] || null;
};

export const updateConnectedDevice = async (id, data) => {
    const allowed = ["user_id","device_name","device_type","last_sync","is_active"];
    const updates = [];
    const params = [];
    let idx = 1;
    for (const k of allowed) {
        if (data[k] !== undefined) {
            updates.push(`${k} = $${idx++}`);
            params.push(data[k]);
        }
    }
    if (updates.length === 0) return null;
    params.push(id);
    const result = await db.query(
        `UPDATE connected_device SET ${updates.join(", ")} WHERE device_id = $${idx} RETURNING device_id, user_id, device_name, device_type, last_sync, is_active`,
        params
    );
    return result.rows[0] || null;
};

export const deleteConnectedDevice = async (id) => {
    const result = await db.query(`DELETE FROM connected_device WHERE device_id = $1 RETURNING device_id`, [id]);
    return result.rows[0] || null;
};

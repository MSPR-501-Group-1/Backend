import { db } from "../db.js";
import { v4 as uuidv4 } from "uuid";

export const getBiometricMeasures = async () => {
    const result = await db.query(`
        SELECT measure_id, user_id, type, value, measured_at, source_device_id
        FROM biometric_measure
    `);
    return result.rows;
};

export const getBiometricMeasureById = async (id) => {
    const result = await db.query(
        `SELECT measure_id, user_id, type, value, measured_at, source_device_id FROM biometric_measure WHERE measure_id = $1`,
        [id]
    );
    return result.rows[0] || null;
};

export const createBiometricMeasure = async (data) => {
    const { user_id, type, value, measured_at, source_device_id } = data;
    const measure_id = uuidv4();
    const result = await db.query(
        `INSERT INTO biometric_measure (measure_id, user_id, type, value, measured_at, source_device_id)
         VALUES ($1,$2,$3,$4,$5,$6)
         RETURNING measure_id, user_id, type, value, measured_at, source_device_id`,
        [measure_id, user_id, type || null, value, measured_at || null, source_device_id || null]
    );
    return result.rows[0] || null;
};

export const updateBiometricMeasure = async (id, data) => {
    const allowed = ["user_id","type","value","measured_at","source_device_id"];
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
        `UPDATE biometric_measure SET ${updates.join(", ")} WHERE measure_id = $${idx} RETURNING measure_id, user_id, type, value, measured_at, source_device_id`,
        params
    );
    return result.rows[0] || null;
};

export const deleteBiometricMeasure = async (id) => {
    const result = await db.query(`DELETE FROM biometric_measure WHERE measure_id = $1 RETURNING measure_id`, [id]);
    return result.rows[0] || null;
};

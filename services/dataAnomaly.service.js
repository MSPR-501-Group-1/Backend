import { db } from "../db.js";
import { v4 as uuidv4 } from "uuid";

export const getDataAnomalies = async () => {
    const result = await db.query(`
        SELECT anomaly_id, execution_id, check_id, source_table, anomaly_type, field_name, record_identifier, original_value, detected_at, severity, is_resolved, resolution_action
        FROM data_anomaly
    `);
    return result.rows;
};

export const getDataAnomalyById = async (id) => {
    const result = await db.query(
        `SELECT anomaly_id, execution_id, check_id, source_table, anomaly_type, field_name, record_identifier, original_value, detected_at, severity, is_resolved, resolution_action FROM data_anomaly WHERE anomaly_id = $1`,
        [id]
    );
    return result.rows[0] || null;
};

export const createDataAnomaly = async (data) => {
    const { execution_id, check_id, source_table, anomaly_type, field_name, record_identifier, original_value, detected_at, severity, is_resolved, resolution_action } = data;
    const anomaly_id = uuidv4();
    const result = await db.query(
        `INSERT INTO data_anomaly (anomaly_id, execution_id, check_id, source_table, anomaly_type, field_name, record_identifier, original_value, detected_at, severity, is_resolved, resolution_action)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         RETURNING anomaly_id, execution_id, check_id, source_table, anomaly_type, field_name, record_identifier, original_value, detected_at, severity, is_resolved, resolution_action`,
        [anomaly_id, execution_id || null, check_id || null, source_table || null, anomaly_type || null, field_name || null, record_identifier || null, original_value || null, detected_at || null, severity || null, is_resolved !== false, resolution_action || null]
    );
    return result.rows[0] || null;
};

export const updateDataAnomaly = async (id, data) => {
    const allowed = ["execution_id","check_id","source_table","anomaly_type","field_name","record_identifier","original_value","detected_at","severity","is_resolved","resolution_action"];
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
        `UPDATE data_anomaly SET ${updates.join(", ")} WHERE anomaly_id = $${idx} RETURNING anomaly_id, execution_id, check_id, source_table, anomaly_type, field_name, record_identifier, original_value, detected_at, severity, is_resolved, resolution_action`,
        params
    );
    return result.rows[0] || null;
};

export const deleteDataAnomaly = async (id) => {
    const result = await db.query(`DELETE FROM data_anomaly WHERE anomaly_id = $1 RETURNING anomaly_id`, [id]);
    return result.rows[0] || null;
};

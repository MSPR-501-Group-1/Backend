import { db } from "../db.js";
import { v4 as uuidv4 } from "uuid";

export const getDataSources = async () => {
    const result = await db.query(`
        SELECT source_id, source_name, source_type, source_url, format, expected_records, last_updated, is_active
        FROM data_source
    `);
    return result.rows;
};

export const getDataSourceById = async (id) => {
    const result = await db.query(
        `SELECT source_id, source_name, source_type, source_url, format, expected_records, last_updated, is_active FROM data_source WHERE source_id = $1`,
        [id]
    );
    return result.rows[0] || null;
};

export const createDataSource = async (data) => {
    const { source_name, source_type, source_url, format, expected_records, last_updated, is_active } = data;
    const source_id = uuidv4();
    const result = await db.query(
        `INSERT INTO data_source (source_id, source_name, source_type, source_url, format, expected_records, last_updated, is_active)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         RETURNING source_id, source_name, source_type, source_url, format, expected_records, last_updated, is_active`,
        [source_id, source_name, source_type || null, source_url || null, format || null, expected_records || null, last_updated || null, is_active !== false]
    );
    return result.rows[0] || null;
};

export const updateDataSource = async (id, data) => {
    const allowed = ["source_name","source_type","source_url","format","expected_records","last_updated","is_active"];
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
        `UPDATE data_source SET ${updates.join(", ")} WHERE source_id = $${idx} RETURNING source_id, source_name, source_type, source_url, format, expected_records, last_updated, is_active`,
        params
    );
    return result.rows[0] || null;
};

export const deleteDataSource = async (id) => {
    const result = await db.query(`DELETE FROM data_source WHERE source_id = $1 RETURNING source_id`, [id]);
    return result.rows[0] || null;
};

import { db } from "../db.js";
import { v4 as uuidv4 } from "uuid";

export const getEtlExecutions = async () => {
    const result = await db.query(`
        SELECT execution_id, source_id, started_at, ended_at, status, records_extracted, records_loaded, records_rejected, error_message, triggered_by
        FROM etl_execution
    `);
    return result.rows;
};

export const getEtlExecutionById = async (id) => {
    const result = await db.query(
        `SELECT execution_id, source_id, started_at, ended_at, status, records_extracted, records_loaded, records_rejected, error_message, triggered_by FROM etl_execution WHERE execution_id = $1`,
        [id]
    );
    return result.rows[0] || null;
};

export const createEtlExecution = async (data) => {
    const { source_id, started_at, ended_at, status, records_extracted, records_loaded, records_rejected, error_message, triggered_by } = data;
    const execution_id = uuidv4();
    const result = await db.query(
        `INSERT INTO etl_execution (execution_id, source_id, started_at, ended_at, status, records_extracted, records_loaded, records_rejected, error_message, triggered_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         RETURNING execution_id, source_id, started_at, ended_at, status, records_extracted, records_loaded, records_rejected, error_message, triggered_by`,
        [execution_id, source_id || null, started_at || null, ended_at || null, status || null, records_extracted || 0, records_loaded || 0, records_rejected || 0, error_message || null, triggered_by || null]
    );
    return result.rows[0] || null;
};

export const updateEtlExecution = async (id, data) => {
    const allowed = ["source_id","started_at","ended_at","status","records_extracted","records_loaded","records_rejected","error_message","triggered_by"];
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
        `UPDATE etl_execution SET ${updates.join(", ")} WHERE execution_id = $${idx} RETURNING execution_id, source_id, started_at, ended_at, status, records_extracted, records_loaded, records_rejected, error_message, triggered_by`,
        params
    );
    return result.rows[0] || null;
};

export const deleteEtlExecution = async (id) => {
    const result = await db.query(`DELETE FROM etl_execution WHERE execution_id = $1 RETURNING execution_id`, [id]);
    return result.rows[0] || null;
};

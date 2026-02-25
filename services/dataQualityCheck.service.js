import { db } from "../db.js";
import { v4 as uuidv4 } from "uuid";

export const getDataQualityChecks = async () => {
    const result = await db.query(`
        SELECT check_id, execution_id, target_table, check_type, check_rule, records_checked, records_failed, failure_rate, checked_at, status
        FROM data_quality_check
    `);
    return result.rows;
};

export const getDataQualityCheckById = async (id) => {
    const result = await db.query(
        `SELECT check_id, execution_id, target_table, check_type, check_rule, records_checked, records_failed, failure_rate, checked_at, status FROM data_quality_check WHERE check_id = $1`,
        [id]
    );
    return result.rows[0] || null;
};

export const createDataQualityCheck = async (data) => {
    const { execution_id, target_table, check_type, check_rule, records_checked, records_failed, failure_rate, checked_at, status } = data;
    const check_id = uuidv4();
    const result = await db.query(
        `INSERT INTO data_quality_check (check_id, execution_id, target_table, check_type, check_rule, records_checked, records_failed, failure_rate, checked_at, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         RETURNING check_id, execution_id, target_table, check_type, check_rule, records_checked, records_failed, failure_rate, checked_at, status`,
        [check_id, execution_id || null, target_table || null, check_type || null, check_rule || null, records_checked || 0, records_failed || 0, failure_rate || null, checked_at || null, status || null]
    );
    return result.rows[0] || null;
};

export const updateDataQualityCheck = async (id, data) => {
    const allowed = ["execution_id","target_table","check_type","check_rule","records_checked","records_failed","failure_rate","checked_at","status"];
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
        `UPDATE data_quality_check SET ${updates.join(", ")} WHERE check_id = $${idx} RETURNING check_id, execution_id, target_table, check_type, check_rule, records_checked, records_failed, failure_rate, checked_at, status`,
        params
    );
    return result.rows[0] || null;
};

export const deleteDataQualityCheck = async (id) => {
    const result = await db.query(`DELETE FROM data_quality_check WHERE check_id = $1 RETURNING check_id`, [id]);
    return result.rows[0] || null;
};

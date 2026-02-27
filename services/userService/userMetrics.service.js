import { db } from "../../db.js";
import { v4 as uuidv4 } from "uuid";

export const getUserMetrics = async () => {
    const result = await db.query(`
        SELECT metric_id, user_id, recorded_date, weight_kg, body_fat_percentage, steps, calories_burned, heart_rate_avg, heart_rate_max, sleep_hours, created_at
        FROM user_metrics
    `);
    return result.rows;
};

export const getUserMetricById = async (id) => {
    const result = await db.query(
        `SELECT metric_id, user_id, recorded_date, weight_kg, body_fat_percentage, steps, calories_burned, heart_rate_avg, heart_rate_max, sleep_hours, created_at FROM user_metrics WHERE metric_id = $1`,
        [id]
    );
    return result.rows[0] || null;
};

export const createUserMetric = async (data) => {
    const { user_id, recorded_date, weight_kg, body_fat_percentage, steps, calories_burned, heart_rate_avg, heart_rate_max, sleep_hours } = data;
    const metric_id = uuidv4();
    const result = await db.query(
        `INSERT INTO user_metrics (metric_id, user_id, recorded_date, weight_kg, body_fat_percentage, steps, calories_burned, heart_rate_avg, heart_rate_max, sleep_hours, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())
         RETURNING metric_id, user_id, recorded_date, weight_kg, body_fat_percentage, steps, calories_burned, heart_rate_avg, heart_rate_max, sleep_hours, created_at`,
        [metric_id, user_id, recorded_date, weight_kg || null, body_fat_percentage || null, steps || null, calories_burned || null, heart_rate_avg || null, heart_rate_max || null, sleep_hours || null]
    );
    return result.rows[0] || null;
};

export const updateUserMetric = async (id, data) => {
    const allowed = ["user_id","recorded_date","weight_kg","body_fat_percentage","steps","calories_burned","heart_rate_avg","heart_rate_max","sleep_hours"];
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
        `UPDATE user_metrics SET ${updates.join(", ")} WHERE metric_id = $${idx} RETURNING metric_id, user_id, recorded_date, weight_kg, body_fat_percentage, steps, calories_burned, heart_rate_avg, heart_rate_max, sleep_hours, created_at`,
        params
    );
    return result.rows[0] || null;
};

export const deleteUserMetric = async (id) => {
    const result = await db.query(`DELETE FROM user_metrics WHERE metric_id = $1 RETURNING metric_id`, [id]);
    return result.rows[0] || null;
};

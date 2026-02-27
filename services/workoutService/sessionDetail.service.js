import { db } from "../../db.js";
import { v4 as uuidv4 } from "uuid";

export const getSessionDetails = async () => {
    const result = await db.query(`
        SELECT detail_id, session_id, exercise_id, sets, reps, weight_kg
        FROM session_detail
    `);
    return result.rows;
};

export const getSessionDetailById = async (id) => {
    const result = await db.query(
        `SELECT detail_id, session_id, exercise_id, sets, reps, weight_kg FROM session_detail WHERE detail_id = $1`,
        [id]
    );
    return result.rows[0] || null;
};

export const createSessionDetail = async (data) => {
    const { session_id, exercise_id, sets, reps, weight_kg } = data;
    const detail_id = uuidv4();
    const result = await db.query(
        `INSERT INTO session_detail (detail_id, session_id, exercise_id, sets, reps, weight_kg)
         VALUES ($1,$2,$3,$4,$5,$6)
         RETURNING detail_id, session_id, exercise_id, sets, reps, weight_kg`,
        [detail_id, session_id, exercise_id, sets || null, reps || null, weight_kg || null]
    );
    return result.rows[0] || null;
};

export const updateSessionDetail = async (id, data) => {
    const allowed = ["session_id","exercise_id","sets","reps","weight_kg"];
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
        `UPDATE session_detail SET ${updates.join(", ")} WHERE detail_id = $${idx} RETURNING detail_id, session_id, exercise_id, sets, reps, weight_kg`,
        params
    );
    return result.rows[0] || null;
};

export const deleteSessionDetail = async (id) => {
    const result = await db.query(`DELETE FROM session_detail WHERE detail_id = $1 RETURNING detail_id`, [id]);
    return result.rows[0] || null;
};

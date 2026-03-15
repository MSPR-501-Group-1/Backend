import { db } from "../../db.js";
import { v4 as uuidv4 } from "uuid";

export const getWorkoutSessions = async () => {
    const result = await db.query(`
        SELECT session_id, user_id, activity_id, start_time, duration_minutes, calories_burned, distance_km, notes
        FROM workout_session
    `);
    return result.rows;
};

export const getWorkoutSessionById = async (id) => {
    const result = await db.query(
        `SELECT session_id, user_id, activity_id, start_time, duration_minutes, calories_burned, distance_km, notes FROM workout_session WHERE session_id = $1`,
        [id]
    );
    return result.rows[0] || null;
};

export const createWorkoutSession = async (data) => {
    const { user_id, activity_id, start_time, duration_minutes, calories_burned, distance_km, notes } = data;
    const session_id = uuidv4();
    const result = await db.query(
        `INSERT INTO workout_session (session_id, user_id, activity_id, start_time, duration_minutes, calories_burned, distance_km, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         RETURNING session_id, user_id, activity_id, start_time, duration_minutes, calories_burned, distance_km, notes`,
        [session_id, user_id, activity_id || null, start_time || null, duration_minutes || null, calories_burned || null, distance_km || null, notes || null]
    );
    return result.rows[0] || null;
};

export const updateWorkoutSession = async (id, data) => {
    const allowed = ["user_id","activity_id","start_time","duration_minutes","calories_burned","distance_km","notes"];
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
        `UPDATE workout_session SET ${updates.join(", ")} WHERE session_id = $${idx} RETURNING session_id, user_id, activity_id, start_time, duration_minutes, calories_burned, distance_km, notes`,
        params
    );
    return result.rows[0] || null;
};

export const deleteWorkoutSession = async (id) => {
    const result = await db.query(`DELETE FROM workout_session WHERE session_id = $1 RETURNING session_id`, [id]);
    return result.rows[0] || null;
};

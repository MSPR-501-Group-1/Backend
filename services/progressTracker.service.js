import { db } from "../db.js";
import { v4 as uuidv4 } from "uuid";

export const getProgressTrackers = async () => {
    const result = await db.query(`
        SELECT progress_id, user_id, tracking_date, weight_kg, body_fat_percentage, weekly_workouts_count, weekly_calories_avg, goal_achievement_json, created_at
        FROM progress_tracker
    `);
    return result.rows;
};

export const getProgressTrackerById = async (id) => {
    const result = await db.query(
        `SELECT progress_id, user_id, tracking_date, weight_kg, body_fat_percentage, weekly_workouts_count, weekly_calories_avg, goal_achievement_json, created_at FROM progress_tracker WHERE progress_id = $1`,
        [id]
    );
    return result.rows[0] || null;
};

export const createProgressTracker = async (data) => {
    const { user_id, tracking_date, weight_kg, body_fat_percentage, weekly_workouts_count, weekly_calories_avg, goal_achievement_json } = data;
    const progress_id = uuidv4();
    const result = await db.query(
        `INSERT INTO progress_tracker (progress_id, user_id, tracking_date, weight_kg, body_fat_percentage, weekly_workouts_count, weekly_calories_avg, goal_achievement_json, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
         RETURNING progress_id, user_id, tracking_date, weight_kg, body_fat_percentage, weekly_workouts_count, weekly_calories_avg, goal_achievement_json, created_at`,
        [progress_id, user_id, tracking_date, weight_kg || null, body_fat_percentage || null, weekly_workouts_count || null, weekly_calories_avg || null, goal_achievement_json || {}]
    );
    return result.rows[0] || null;
};

export const updateProgressTracker = async (id, data) => {
    const allowed = ["user_id","tracking_date","weight_kg","body_fat_percentage","weekly_workouts_count","weekly_calories_avg","goal_achievement_json"];
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
        `UPDATE progress_tracker SET ${updates.join(", ")} WHERE progress_id = $${idx} RETURNING progress_id, user_id, tracking_date, weight_kg, body_fat_percentage, weekly_workouts_count, weekly_calories_avg, goal_achievement_json, created_at`,
        params
    );
    return result.rows[0] || null;
};

export const deleteProgressTracker = async (id) => {
    const result = await db.query(`DELETE FROM progress_tracker WHERE progress_id = $1 RETURNING progress_id`, [id]);
    return result.rows[0] || null;
};

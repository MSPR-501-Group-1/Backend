import { db } from "../db.js";
import { v4 as uuidv4 } from "uuid";

export const getUserProfiles = async () => {
    const result = await db.query(`
        SELECT profile_id, user_id, height_cm, current_weight_kg, activity_level_ref, goal_id, allergies_json, preferences_json, updated_at
        FROM user_profile
    `);
    return result.rows;
};

export const getUserProfileById = async (id) => {
    const result = await db.query(
        `SELECT profile_id, user_id, height_cm, current_weight_kg, activity_level_ref, health_goal_id, allergies_json, preferences_json, updated_at FROM user_profile WHERE profile_id = $1`,
        [id]
    );
    return result.rows[0] || null;
};

export const createUserProfile = async (data) => {
    const { user_id, height_cm, current_weight_kg, activity_level_ref, health_goal_id, allergies_json, preferences_json } = data;
    const profile_id = uuidv4();
    const result = await db.query(
        `INSERT INTO user_profile (profile_id, user_id, height_cm, current_weight_kg, activity_level_ref, health_goal_id, allergies_json, preferences_json, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
         RETURNING profile_id, user_id, height_cm, current_weight_kg, activity_level_ref, health_goal_id, allergies_json, preferences_json, updated_at`,
        [profile_id, user_id, height_cm || null, current_weight_kg || null, activity_level_ref || null, health_goal_id || null, allergies_json || [], preferences_json || {}]
    );
    return result.rows[0] || null;
};

export const updateUserProfile = async (id, data) => {
    const allowed = ["user_id","height_cm","current_weight_kg","activity_level_ref","health_goal_id","allergies_json","preferences_json"];
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
        `UPDATE user_profile SET ${updates.join(", ")}, updated_at = NOW() WHERE profile_id = $${idx} RETURNING profile_id, user_id, height_cm, current_weight_kg, activity_level_ref, health_goal_id, allergies_json, preferences_json, updated_at`,
        params
    );
    return result.rows[0] || null;
};

export const deleteUserProfile = async (id) => {
    const result = await db.query(`DELETE FROM user_profile WHERE profile_id = $1 RETURNING profile_id`, [id]);
    return result.rows[0] || null;
};

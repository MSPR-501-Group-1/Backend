import { db } from "../db.js";
import { v4 as uuidv4 } from "uuid";

export const getExercises = async () => {
    const result = await db.query(`
        SELECT exercise_id, name, body_part_target, video_url, description, difficulty_level, equipment_required, category
        FROM exercise
    `);
    return result.rows;
};

export const getExerciseById = async (id) => {
    const result = await db.query(
        `SELECT exercise_id, name, body_part_target, video_url, description, difficulty_level, equipment_required, category FROM exercise WHERE exercise_id = $1`,
        [id]
    );
    return result.rows[0] || null;
};

export const createExercise = async (data) => {
    const { name, body_part_target, video_url, description, difficulty_level, equipment_required, category } = data;
    const exercise_id = uuidv4();
    const result = await db.query(
        `INSERT INTO exercise (exercise_id, name, body_part_target, video_url, description, difficulty_level, equipment_required, category)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         RETURNING exercise_id, name, body_part_target, video_url, description, difficulty_level, equipment_required, category`,
        [exercise_id, name, body_part_target || null, video_url || null, description || null, difficulty_level || null, equipment_required || null, category || null]
    );
    return result.rows[0] || null;
};

export const updateExercise = async (id, data) => {
    const allowed = ["name","body_part_target","video_url","description","difficulty_level","equipment_required","category"];
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
        `UPDATE exercise SET ${updates.join(", ")} WHERE exercise_id = $${idx} RETURNING exercise_id, name, body_part_target, video_url, description, difficulty_level, equipment_required, category`,
        params
    );
    return result.rows[0] || null;
};

export const deleteExercise = async (id) => {
    const result = await db.query(`DELETE FROM exercise WHERE exercise_id = $1 RETURNING exercise_id`, [id]);
    return result.rows[0] || null;
};

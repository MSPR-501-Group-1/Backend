import { db } from "../db.js";
import { v4 as uuidv4 } from "uuid";

export const getHealthGoals = async () => {
    const result = await db.query(`SELECT goal_id, label, description FROM health_goal`);
    return result.rows;
};

export const getHealthGoalById = async (id) => {
    const result = await db.query(`SELECT goal_id, label, description FROM health_goal WHERE goal_id = $1`, [id]);
    return result.rows[0] || null;
};

export const createHealthGoal = async (data) => {
    const { label, description } = data;
    const goal_id = uuidv4();
    const result = await db.query(
        `INSERT INTO health_goal (goal_id, label, description) VALUES ($1,$2,$3) RETURNING goal_id, label, description`,
        [goal_id, label, description || null]
    );
    return result.rows[0] || null;
};

export const updateHealthGoal = async (id, data) => {
    const allowed = ["label","description"];
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
        `UPDATE health_goal SET ${updates.join(", ")} WHERE goal_id = $${idx} RETURNING goal_id, label, description`,
        params
    );
    return result.rows[0] || null;
};

export const deleteHealthGoal = async (id) => {
    const result = await db.query(`DELETE FROM health_goal WHERE goal_id = $1 RETURNING goal_id`, [id]);
    return result.rows[0] || null;
};

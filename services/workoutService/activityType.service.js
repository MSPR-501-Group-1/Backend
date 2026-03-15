import { db } from "../db.js";
import { v4 as uuidv4 } from "uuid";

export const getActivityTypes = async () => {
    const result = await db.query(`
        SELECT activity_id, name, met_value, icon_url
        FROM activity_type
    `);
    return result.rows;
};

export const getActivityTypeById = async (id) => {
    const result = await db.query(
        `SELECT activity_id, name, met_value, icon_url FROM activity_type WHERE activity_id = $1`,
        [id]
    );
    return result.rows[0] || null;
};

export const createActivityType = async (data) => {
    const { name, met_value, icon_url } = data;
    const activity_id = uuidv4();
    const result = await db.query(
        `INSERT INTO activity_type (activity_id, name, met_value, icon_url)
         VALUES ($1,$2,$3,$4)
         RETURNING activity_id, name, met_value, icon_url`,
        [activity_id, name, met_value || null, icon_url || null]
    );
    return result.rows[0] || null;
};

export const updateActivityType = async (id, data) => {
    const allowed = ["name","met_value","icon_url"];
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
        `UPDATE activity_type SET ${updates.join(", ")} WHERE activity_id = $${idx} RETURNING activity_id, name, met_value, icon_url`,
        params
    );
    return result.rows[0] || null;
};

export const deleteActivityType = async (id) => {
    const result = await db.query(`DELETE FROM activity_type WHERE activity_id = $1 RETURNING activity_id`, [id]);
    return result.rows[0] || null;
};

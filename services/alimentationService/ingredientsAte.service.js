import { db } from "../../db.js";
import { v4 as uuidv4 } from "uuid";

export const getEntries = async () => {
    const result = await db.query(`
        SELECT entry_id, consumed_at, quantity_grams, meal_type, calories_consumed, user_id
        FROM ingredients_ate
    `);
    return result.rows;
};

export const getEntryById = async (id) => {
    const result = await db.query(
        `SELECT entry_id, consumed_at, quantity_grams, meal_type, calories_consumed, user_id FROM ingredients_ate WHERE entry_id = $1`,
        [id]
    );
    return result.rows[0] || null;
};

export const createEntry = async (data) => {
    const { consumed_at, quantity_grams, meal_type, calories_consumed, user_id } = data;
    const entry_id = uuidv4();
    const result = await db.query(
        `INSERT INTO ingredients_ate (entry_id, consumed_at, quantity_grams, meal_type, calories_consumed, user_id)
         VALUES ($1,$2,$3,$4,$5,$6)
         RETURNING entry_id, consumed_at, quantity_grams, meal_type, calories_consumed, user_id`,
        [entry_id, consumed_at || null, quantity_grams || null, meal_type || null, calories_consumed || null, user_id]
    );
    return result.rows[0] || null;
};

export const updateEntry = async (id, data) => {
    const allowed = ["consumed_at","quantity_grams","meal_type","calories_consumed","user_id"];
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
        `UPDATE ingredients_ate SET ${updates.join(", ")} WHERE entry_id = $${idx} RETURNING entry_id, consumed_at, quantity_grams, meal_type, calories_consumed, user_id`,
        params
    );
    return result.rows[0] || null;
};

export const deleteEntry = async (id) => {
    const result = await db.query(`DELETE FROM ingredients_ate WHERE entry_id = $1 RETURNING entry_id`, [id]);
    return result.rows[0] || null;
};

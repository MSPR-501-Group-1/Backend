import { db } from "../db.js";
import { v4 as uuidv4 } from "uuid";

export const getFoodDiaryEntries = async () => {
    const result = await db.query(`
        SELECT entry_id, user_id, food_id, consumed_at, quantity_grams, meal_type, calories_consumed
        FROM food_diary_entry
    `);
    return result.rows;
};

export const getFoodDiaryById = async (id) => {
    const result = await db.query(
        `SELECT entry_id, user_id, food_id, consumed_at, quantity_grams, meal_type, calories_consumed FROM food_diary_entry WHERE entry_id = $1`,
        [id]
    );
    return result.rows[0] || null;
};

export const createFoodDiaryEntry = async (data) => {
    const { user_id, food_id, consumed_at, quantity_grams, meal_type, calories_consumed } = data;
    const entry_id = uuidv4();
    const result = await db.query(
        `INSERT INTO food_diary_entry (entry_id, user_id, food_id, consumed_at, quantity_grams, meal_type, calories_consumed)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         RETURNING entry_id, user_id, food_id, consumed_at, quantity_grams, meal_type, calories_consumed`,
        [entry_id, user_id, food_id, consumed_at || null, quantity_grams, meal_type || null, calories_consumed || null]
    );
    return result.rows[0] || null;
};

export const updateFoodDiaryEntry = async (id, data) => {
    const allowed = ["user_id","food_id","consumed_at","quantity_grams","meal_type","calories_consumed"];
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
        `UPDATE food_diary_entry SET ${updates.join(", ")} WHERE entry_id = $${idx} RETURNING entry_id, user_id, food_id, consumed_at, quantity_grams, meal_type, calories_consumed`,
        params
    );
    return result.rows[0] || null;
};

export const deleteFoodDiaryEntry = async (id) => {
    const result = await db.query(`DELETE FROM food_diary_entry WHERE entry_id = $1 RETURNING entry_id`, [id]);
    return result.rows[0] || null;
};

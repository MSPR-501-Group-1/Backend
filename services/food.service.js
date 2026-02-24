import { db } from "../db.js";
import { v4 as uuidv4 } from "uuid";

export const getFoods = async () => {
    const result = await db.query(`
        SELECT food_id, name, brand, calories_100g, protein_100g, carbs_100g, fat_100g, nutriscore, category_ref, fiber_g, sugar_g, sodium_mg, cholesterol_mg
        FROM food
    `);
    return result.rows;
};

export const getFoodById = async (id) => {
    const result = await db.query(
        `SELECT food_id, name, brand, calories_100g, protein_100g, carbs_100g, fat_100g, nutriscore, category_ref, fiber_g, sugar_g, sodium_mg, cholesterol_mg
         FROM food WHERE food_id = $1`,
        [id]
    );
    return result.rows[0] || null;
};

export const createFood = async (data) => {
    const {
        name, brand, calories_100g, protein_100g, carbs_100g, fat_100g, nutriscore, category_ref, fiber_g, sugar_g, sodium_mg, cholesterol_mg
    } = data;
    const food_id = uuidv4();
    const result = await db.query(
        `INSERT INTO food (food_id, name, brand, calories_100g, protein_100g, carbs_100g, fat_100g, nutriscore, category_ref, fiber_g, sugar_g, sodium_mg, cholesterol_mg)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         RETURNING food_id, name, brand, calories_100g, protein_100g, carbs_100g, fat_100g, nutriscore, category_ref, fiber_g, sugar_g, sodium_mg, cholesterol_mg`,
        [food_id, name, brand || null, calories_100g || null, protein_100g || null, carbs_100g || null, fat_100g || null, nutriscore || null, category_ref || null, fiber_g || null, sugar_g || null, sodium_mg || null, cholesterol_mg || null]
    );
    return result.rows[0] || null;
};

export const updateFood = async (id, data) => {
    const allowed = ["name","brand","calories_100g","protein_100g","carbs_100g","fat_100g","nutriscore","category_ref","fiber_g","sugar_g","sodium_mg","cholesterol_mg"];
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
        `UPDATE food SET ${updates.join(", ")} WHERE food_id = $${idx} RETURNING food_id, name, brand, calories_100g, protein_100g, carbs_100g, fat_100g, nutriscore, category_ref, fiber_g, sugar_g, sodium_mg, cholesterol_mg`,
        params
    );
    return result.rows[0] || null;
};

export const deleteFood = async (id) => {
    const result = await db.query(`DELETE FROM food WHERE food_id = $1 RETURNING food_id`, [id]);
    return result.rows[0] || null;
};

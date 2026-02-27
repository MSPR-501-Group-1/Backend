import { db } from "../../db.js";
import { v4 as uuidv4 } from "uuid";

export const getIngredients = async () => {
    const result = await db.query(`
        SELECT ingredients_id, name, brand, calories_100g, fat_100g, nutriscore, category_ref, fiber_g, sugar_g, sodium_mg, cholesterol_mg, protein_100g, carbs_100g
        FROM ingredients
    `);
    return result.rows;
};

export const getIngredientById = async (id) => {
    const result = await db.query(
        `SELECT ingredients_id, name, brand, calories_100g, fat_100g, nutriscore, category_ref, fiber_g, sugar_g, sodium_mg, cholesterol_mg, protein_100g, carbs_100g FROM ingredients WHERE ingredients_id = $1`,
        [id]
    );
    return result.rows[0] || null;
};

export const createIngredient = async (data) => {
    const {
        name, brand, calories_100g, fat_100g, nutriscore, category_ref, fiber_g, sugar_g, sodium_mg, cholesterol_mg, protein_100g, carbs_100g
    } = data;

    const ingredients_id = uuidv4();
    const result = await db.query(
        `INSERT INTO ingredients (ingredients_id, name, brand, calories_100g, fat_100g, nutriscore, category_ref, fiber_g, sugar_g, sodium_mg, cholesterol_mg, protein_100g, carbs_100g)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         RETURNING ingredients_id, name, brand, calories_100g, fat_100g, nutriscore, category_ref, fiber_g, sugar_g, sodium_mg, cholesterol_mg, protein_100g, carbs_100g`,
        [ingredients_id, name || null, brand || null, calories_100g || null, fat_100g || null, nutriscore || null, category_ref || null, fiber_g || null, sugar_g || null, sodium_mg || null, cholesterol_mg || null, protein_100g || null, carbs_100g || null]
    );
    return result.rows[0] || null;
};

export const updateIngredient = async (id, data) => {
    const allowed = ["name","brand","calories_100g","fat_100g","nutriscore","category_ref","fiber_g","sugar_g","sodium_mg","cholesterol_mg","protein_100g","carbs_100g"];
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
        `UPDATE ingredients SET ${updates.join(", ")} WHERE ingredients_id = $${idx} RETURNING ingredients_id, name, brand, calories_100g, fat_100g, nutriscore, category_ref, fiber_g, sugar_g, sodium_mg, cholesterol_mg, protein_100g, carbs_100g`,
        params
    );
    return result.rows[0] || null;
};

export const deleteIngredient = async (id) => {
    const result = await db.query(`DELETE FROM ingredients WHERE ingredients_id = $1 RETURNING ingredients_id`, [id]);
    return result.rows[0] || null;
};

import { db } from "../../db.js";
import { v4 as uuidv4 } from "uuid";

export const getRecipeIngredients = async () => {
    const result = await db.query(`
        SELECT link_id, recipe_id, food_id, quantity_grams
        FROM recipe_ingredient
    `);
    return result.rows;
};

export const getRecipeIngredientById = async (id) => {
    const result = await db.query(
        `SELECT link_id, recipe_id, food_id, quantity_grams FROM recipe_ingredient WHERE link_id = $1`,
        [id]
    );
    return result.rows[0] || null;
};

export const createRecipeIngredient = async (data) => {
    const { recipe_id, food_id, quantity_grams } = data;
    const link_id = uuidv4();
    const result = await db.query(
        `INSERT INTO recipe_ingredient (link_id, recipe_id, food_id, quantity_grams)
         VALUES ($1,$2,$3,$4)
         RETURNING link_id, recipe_id, food_id, quantity_grams`,
        [link_id, recipe_id, food_id, quantity_grams]
    );
    return result.rows[0] || null;
};

export const updateRecipeIngredient = async (id, data) => {
    const allowed = ["recipe_id","food_id","quantity_grams"];
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
        `UPDATE recipe_ingredient SET ${updates.join(", ")} WHERE link_id = $${idx} RETURNING link_id, recipe_id, food_id, quantity_grams`,
        params
    );
    return result.rows[0] || null;
};

export const deleteRecipeIngredient = async (id) => {
    const result = await db.query(`DELETE FROM recipe_ingredient WHERE link_id = $1 RETURNING link_id`, [id]);
    return result.rows[0] || null;
};

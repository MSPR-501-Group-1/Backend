import { db } from "../../db.js";
import { v4 as uuidv4 } from "uuid";

export const getRecipes = async () => {
    const result = await db.query(`
        SELECT recipe_id, title, instructions, prep_time_min, difficulty, created_by_user_id
        FROM recipe
    `);
    return result.rows;
};

export const getRecipeById = async (id) => {
    const result = await db.query(
        `SELECT recipe_id, title, instructions, prep_time_min, difficulty, created_by_user_id
         FROM recipe WHERE recipe_id = $1`,
        [id]
    );
    return result.rows[0] || null;
};

export const createRecipe = async (data) => {
    const { title, instructions, prep_time_min, difficulty, created_by_user_id } = data;
    const recipe_id = uuidv4();
    const result = await db.query(
        `INSERT INTO recipe (recipe_id, title, instructions, prep_time_min, difficulty, created_by_user_id)
         VALUES ($1,$2,$3,$4,$5,$6)
         RETURNING recipe_id, title, instructions, prep_time_min, difficulty, created_by_user_id`,
        [recipe_id, title, instructions || null, prep_time_min || null, difficulty || null, created_by_user_id || null]
    );
    return result.rows[0] || null;
};

export const updateRecipe = async (id, data) => {
    const allowed = ["title","instructions","prep_time_min","difficulty","created_by_user_id"];
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
        `UPDATE recipe SET ${updates.join(", ")} WHERE recipe_id = $${idx} RETURNING recipe_id, title, instructions, prep_time_min, difficulty, created_by_user_id`,
        params
    );
    return result.rows[0] || null;
};

export const deleteRecipe = async (id) => {
    const result = await db.query(`DELETE FROM recipe WHERE recipe_id = $1 RETURNING recipe_id`, [id]);
    return result.rows[0] || null;
};

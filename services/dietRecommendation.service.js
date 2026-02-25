import { db } from "../db.js";
import { v4 as uuidv4 } from "uuid";

export const getDietRecommendations = async () => {
    const result = await db.query(`
        SELECT recommendation_id, user_id, meal_type, recommended_foods, total_calories, protein_g, carbs_g, fat_g, diet_type, generated_at, is_followed
        FROM diet_recommendation
    `);
    return result.rows;
};

export const getDietRecommendationById = async (id) => {
    const result = await db.query(
        `SELECT recommendation_id, user_id, meal_type, recommended_foods, total_calories, protein_g, carbs_g, fat_g, diet_type, generated_at, is_followed FROM diet_recommendation WHERE recommendation_id = $1`,
        [id]
    );
    return result.rows[0] || null;
};

export const createDietRecommendation = async (data) => {
    const { user_id, meal_type, recommended_foods, total_calories, protein_g, carbs_g, fat_g, diet_type, generated_at, is_followed } = data;
    const recommendation_id = uuidv4();
    const result = await db.query(
        `INSERT INTO diet_recommendation (recommendation_id, user_id, meal_type, recommended_foods, total_calories, protein_g, carbs_g, fat_g, diet_type, generated_at, is_followed)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         RETURNING recommendation_id, user_id, meal_type, recommended_foods, total_calories, protein_g, carbs_g, fat_g, diet_type, generated_at, is_followed`,
        [recommendation_id, user_id, meal_type || null, recommended_foods || [], total_calories || null, protein_g || null, carbs_g || null, fat_g || null, diet_type || null, generated_at || null, is_followed !== false]
    );
    return result.rows[0] || null;
};

export const updateDietRecommendation = async (id, data) => {
    const allowed = ["user_id","meal_type","recommended_foods","total_calories","protein_g","carbs_g","fat_g","diet_type","generated_at","is_followed"];
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
        `UPDATE diet_recommendation SET ${updates.join(", ")} WHERE recommendation_id = $${idx} RETURNING recommendation_id, user_id, meal_type, recommended_foods, total_calories, protein_g, carbs_g, fat_g, diet_type, generated_at, is_followed`,
        params
    );
    return result.rows[0] || null;
};

export const deleteDietRecommendation = async (id) => {
    const result = await db.query(`DELETE FROM diet_recommendation WHERE recommendation_id = $1 RETURNING recommendation_id`, [id]);
    return result.rows[0] || null;
};

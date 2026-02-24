import { db } from "../db.js";
import { v4 as uuidv4 } from "uuid";

export const getAiRecommendations = async () => {
    const result = await db.query(`
        SELECT recommendation_id, user_id, generated_at, category, title, content_text, confidence_score, is_viewed, feedback_rating
        FROM ai_recommendation
    `);
    return result.rows;
};

export const getAiRecommendationById = async (id) => {
    const result = await db.query(
        `SELECT recommendation_id, user_id, generated_at, category, title, content_text, confidence_score, is_viewed, feedback_rating FROM ai_recommendation WHERE recommendation_id = $1`,
        [id]
    );
    return result.rows[0] || null;
};

export const createAiRecommendation = async (data) => {
    const { user_id, generated_at, category, title, content_text, confidence_score, is_viewed, feedback_rating } = data;
    const recommendation_id = uuidv4();
    const result = await db.query(
        `INSERT INTO ai_recommendation (recommendation_id, user_id, generated_at, category, title, content_text, confidence_score, is_viewed, feedback_rating)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         RETURNING recommendation_id, user_id, generated_at, category, title, content_text, confidence_score, is_viewed, feedback_rating`,
        [recommendation_id, user_id, generated_at || null, category || null, title || null, content_text || null, confidence_score || null, is_viewed !== false, feedback_rating || null]
    );
    return result.rows[0] || null;
};

export const updateAiRecommendation = async (id, data) => {
    const allowed = ["user_id","generated_at","category","title","content_text","confidence_score","is_viewed","feedback_rating"];
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
        `UPDATE ai_recommendation SET ${updates.join(", ")} WHERE recommendation_id = $${idx} RETURNING recommendation_id, user_id, generated_at, category, title, content_text, confidence_score, is_viewed, feedback_rating`,
        params
    );
    return result.rows[0] || null;
};

export const deleteAiRecommendation = async (id) => {
    const result = await db.query(`DELETE FROM ai_recommendation WHERE recommendation_id = $1 RETURNING recommendation_id`, [id]);
    return result.rows[0] || null;
};

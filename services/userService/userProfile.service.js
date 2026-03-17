import { db } from "../../db.js";


// GET all user profiles
export const getUserProfiles = async () => {
    const result = await db.query(`
        SELECT user_id, height_cm, current_weight_kg, activity_level_ref, allergies, diet_type, goal_id, updated_at
        FROM user_profile
    `);
    return result.rows;
};

// GET a single user profile by user_id
export const getUserProfileById = async (user_id) => {
    const result = await db.query(
        `SELECT user_id, height_cm, current_weight_kg, activity_level_ref, allergies, diet_type, goal_id, updated_at
         FROM user_profile
         WHERE user_id = $1`,
        [user_id]
    );
    return result.rows[0] || null;
};

// POST a new user profile
export const createUserProfile = async (data) => {
    const { user_id, height_cm, current_weight_kg, activity_level_ref, allergies, diet_type, goal_id } = data;

    // Vérification que le user_id existe bien en BDD
    const existingUser = await db.query(
        "SELECT user_id FROM user_ WHERE user_id = $1",
        [user_id]
    );

    if (existingUser.rows.length === 0) {
        throw new Error("USER_NOT_FOUND");
    }

    // Vérification que le goal_id existe bien en BDD (si fourni)
    if (goal_id) {
        const existingGoal = await db.query(
            "SELECT goal_id FROM health_goal WHERE goal_id = $1",
            [goal_id]
        );
        if (existingGoal.rows.length === 0) {
            throw new Error("GOAL_NOT_FOUND");
        }
    }

    const result = await db.query(
        `INSERT INTO user_profile (user_id, height_cm, current_weight_kg, activity_level_ref, allergies, diet_type, goal_id, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         RETURNING user_id, height_cm, current_weight_kg, activity_level_ref, allergies, diet_type, goal_id, updated_at`,
        [
            user_id,
            height_cm || null,
            current_weight_kg || null,
            activity_level_ref || null,
            allergies || null,
            diet_type || null,
            goal_id || null,
        ]
    );

    return result.rows[0] || null;
};

// PUT a user profile by user_id
export const updateUserProfile = async (user_id, data) => {
    const allowedFields = ["height_cm", "current_weight_kg", "activity_level_ref", "allergies", "diet_type", "goal_id"];
    const updates = [];
    const params = [];
    let paramIndex = 1;

    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            updates.push(`${field} = $${paramIndex++}`);
            params.push(data[field]);
        }
    }

    if (updates.length === 0) {
        throw new Error("NO_FIELDS_TO_UPDATE");
    }

    // Vérification que le goal_id existe bien en BDD (si modifié)
    if (data.goal_id) {
        const existingGoal = await db.query(
            "SELECT goal_id FROM health_goal WHERE goal_id = $1",
            [data.goal_id]
        );
        if (existingGoal.rows.length === 0) {
            throw new Error("GOAL_NOT_FOUND");
        }
    }

    params.push(user_id);

    const result = await db.query(
        `UPDATE user_profile SET ${updates.join(", ")}, updated_at = NOW()
         WHERE user_id = $${paramIndex}
         RETURNING user_id, height_cm, current_weight_kg, activity_level_ref, allergies, diet_type, goal_id, updated_at`,
        params
    );

    return result.rows[0] || null;
};

// DELETE a user profile by user_id
export const deleteUserProfile = async (user_id) => {
    const result = await db.query(
        "DELETE FROM user_profile WHERE user_id = $1 RETURNING user_id",
        [user_id]
    );
    return result.rows[0] || null;
};
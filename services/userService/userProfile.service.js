import { db } from "../../db.js";

const PROFILE_FIELDS = ["height_cm", "current_weight_kg", "allergies", "diet_type"];

const toProfilePayload = (row) => {
    if (!row) {
        return null;
    }

    const goalIds = Array.isArray(row.goal_ids) ? row.goal_ids : [];

    return {
        user_id: row.user_id,
        height_cm: row.height_cm,
        current_weight_kg: row.current_weight_kg,
        allergies: row.allergies,
        diet_type: row.diet_type,
        goal_id: goalIds[0] ?? null,
        goal_ids: goalIds,
        updated_at: row.updated_at,
    };
};

const findProfileById = async (client, user_id) => {
    const result = await client.query(
        `SELECT
            u.user_id,
            u.height_cm,
            u.current_weight_kg,
            u.allergies,
            u.diet_type,
            u.updated_at,
            COALESCE(
                array_agg(uhg.goal_id) FILTER (WHERE uhg.goal_id IS NOT NULL),
                ARRAY[]::varchar[]
            ) AS goal_ids
         FROM user_ u
         LEFT JOIN user_health_goal uhg ON uhg.user_id = u.user_id
         WHERE u.user_id = $1
         GROUP BY u.user_id, u.height_cm, u.current_weight_kg, u.allergies, u.diet_type, u.updated_at`,
        [user_id]
    );

    return result.rows[0] || null;
};

const ensureGoalExists = async (client, goal_id) => {
    if (!goal_id) {
        return;
    }

    const existingGoal = await client.query(
        "SELECT goal_id FROM health_goal WHERE goal_id = $1",
        [goal_id]
    );

    if (existingGoal.rows.length === 0) {
        throw new Error("GOAL_NOT_FOUND");
    }
};

const updateUserColumns = async (client, user_id, data, { requireAtLeastOneField }) => {
    const updates = [];
    const params = [];
    let paramIndex = 1;

    for (const field of PROFILE_FIELDS) {
        if (data[field] !== undefined) {
            updates.push(`${field} = $${paramIndex++}`);
            params.push(data[field]);
        }
    }

    if (updates.length === 0) {
        if (requireAtLeastOneField) {
            throw new Error("NO_FIELDS_TO_UPDATE");
        }
        return;
    }

    params.push(user_id);

    await client.query(
        `UPDATE user_
         SET ${updates.join(", ")}, updated_at = NOW()
         WHERE user_id = $${paramIndex}`,
        params
    );
};

const syncUserGoal = async (client, user_id, goal_id) => {
    await client.query(
        "DELETE FROM user_health_goal WHERE user_id = $1",
        [user_id]
    );

    if (goal_id) {
        await client.query(
            "INSERT INTO user_health_goal (user_id, goal_id) VALUES ($1, $2)",
            [user_id, goal_id]
        );
    }
};

// GET all user profiles
export const getUserProfiles = async () => {
    const result = await db.query(
        `SELECT
            u.user_id,
            u.height_cm,
            u.current_weight_kg,
            u.allergies,
            u.diet_type,
            u.updated_at,
            COALESCE(
                array_agg(uhg.goal_id) FILTER (WHERE uhg.goal_id IS NOT NULL),
                ARRAY[]::varchar[]
            ) AS goal_ids
         FROM user_ u
         LEFT JOIN user_health_goal uhg ON uhg.user_id = u.user_id
         GROUP BY u.user_id, u.height_cm, u.current_weight_kg, u.allergies, u.diet_type, u.updated_at
         ORDER BY u.user_id`
    );

    return result.rows.map(toProfilePayload);
};

// GET a single user profile by user_id
export const getUserProfileById = async (user_id) => {
    const client = await db.connect();

    try {
        const row = await findProfileById(client, user_id);
        return toProfilePayload(row);
    } finally {
        client.release();
    }
};

// POST initialize a user profile for a given user_id
export const createUserProfile = async (user_id, data = {}) => {
    const client = await db.connect();

    try {
        await client.query("BEGIN");

        const existingUser = await client.query(
            "SELECT user_id FROM user_ WHERE user_id = $1",
            [user_id]
        );

        if (existingUser.rows.length === 0) {
            throw new Error("USER_NOT_FOUND");
        }

        if (data.goal_id !== undefined) {
            await ensureGoalExists(client, data.goal_id);
        }

        await updateUserColumns(client, user_id, data, { requireAtLeastOneField: false });

        if (data.goal_id !== undefined) {
            await syncUserGoal(client, user_id, data.goal_id);
        }

        const row = await findProfileById(client, user_id);

        await client.query("COMMIT");
        return toProfilePayload(row);
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

// PUT update a user profile by user_id
export const updateUserProfile = async (user_id, data) => {
    const hasBaseField = PROFILE_FIELDS.some((field) => data[field] !== undefined);
    const hasGoalField = data.goal_id !== undefined;

    if (!hasBaseField && !hasGoalField) {
        throw new Error("NO_FIELDS_TO_UPDATE");
    }

    const client = await db.connect();

    try {
        await client.query("BEGIN");

        const existingUser = await client.query(
            "SELECT user_id FROM user_ WHERE user_id = $1",
            [user_id]
        );

        if (existingUser.rows.length === 0) {
            await client.query("ROLLBACK");
            return null;
        }

        if (hasGoalField) {
            await ensureGoalExists(client, data.goal_id);
        }

        await updateUserColumns(client, user_id, data, { requireAtLeastOneField: false });

        if (hasGoalField) {
            await syncUserGoal(client, user_id, data.goal_id);
        }

        const row = await findProfileById(client, user_id);

        await client.query("COMMIT");
        return toProfilePayload(row);
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

// DELETE reset profile fields and remove goals for a user
export const deleteUserProfile = async (user_id) => {
    const client = await db.connect();

    try {
        await client.query("BEGIN");

        const existingUser = await client.query(
            "SELECT user_id FROM user_ WHERE user_id = $1",
            [user_id]
        );

        if (existingUser.rows.length === 0) {
            await client.query("ROLLBACK");
            return null;
        }

        await client.query(
            `UPDATE user_
             SET height_cm = NULL,
                 current_weight_kg = NULL,
                 allergies = 'NONE',
                 diet_type = 'NONE',
                 updated_at = NOW()
             WHERE user_id = $1`,
            [user_id]
        );

        await client.query(
            "DELETE FROM user_health_goal WHERE user_id = $1",
            [user_id]
        );

        await client.query("COMMIT");
        return { user_id };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};
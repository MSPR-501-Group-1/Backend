import { db } from "../../db.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import * as userProfileService from "./userProfile.service.js";

const SALT_ROUNDS = 10; // Pour le cryptage de mot de passe

// GET all users
export const getUsers = async () => {

    const query = 
    `
        SELECT user_id, email, first_name, last_name, birth_date, gender_code, role_code, created_at, is_active, history_id, profile_id
        FROM user_ 
        WHERE 1=1
    `;

    const result = await db.query(query);

    return result.rows;
};

// GET a single user by id
export const getUserById = async (id) => {

    const query = `
        SELECT user_id, email, first_name, last_name, birth_date, gender_code, role_code, created_at, is_active, history_id, profile_id
        FROM user_ WHERE user_id = $1
    `;

    const result = await db.query(query, [id]);

    return result.rows[0] || null;
};

// POST a new user
export const createUser = async (data) => {
    const { email, password, first_name, last_name, birth_date, gender_code, role_code, is_active } = data;

    // We check if the email already exist, and we send an error if so
    const existingUser = await db.query(
        "SELECT user_id FROM user_ WHERE email = $1",
        [email]
    );

    if (existingUser.rows.length > 0) {
        throw new Error("EMAIL_EXISTS");
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS); // On hash le mot de passe
    const user_id = uuidv4(); // On crée l'uuid

    const result = await db.query(
        `INSERT INTO user_ (user_id, email, password_hash, first_name, last_name, birth_date, gender_code, role_code, created_at, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9)
         RETURNING user_id, email, first_name, last_name, birth_date, gender_code, role_code, created_at, is_active`,
        [user_id, email, password_hash, first_name, last_name, birth_date || null, gender_code || null, role_code || "USER", is_active !== false]
    );

    // Create an empty profile for each new user
    const userProfile = await userProfileService.createUserProfile({ user_id: user_id });

    // Update the user with the profile_id to link them
    const updatedUser = await updateUser(user_id, { profile_id: userProfile.profile_id });

    return updatedUser;
};

// PUT a user by id
export const updateUser = async (id, data) => {
    const allowedFields = ["email", "first_name", "last_name", "birth_date", "gender_code", "role_code", "is_active", "history_id", "profile_id"];
    const updates = [];
    const params = [];
    let paramIndex = 1;

    for (const field of allowedFields) { // On construit la requète en fonction des champs et data données.
        if (data[field] !== undefined) {
            updates.push(`${field} = $${paramIndex++}`);
            params.push(data[field]);
        }
    }

    if (updates.length === 0) {
        throw new Error("NO_FIELDS_TO_UPDATE");
    }

    // Vérifier si l'email est disponible (si un le mail est modifié)
    if (data.email) {
        const existingUser = await db.query(
            "SELECT user_id FROM user_ WHERE email = $1 AND user_id != $2",
            [data.email, id]
        );
        if (existingUser.rows.length > 0) {
            throw new Error("EMAIL_EXISTS");
        }
    }

    params.push(id);

    const result = await db.query(
        `UPDATE user_ SET ${updates.join(", ")} WHERE user_id = $${paramIndex}
         RETURNING user_id, email, first_name, last_name, birth_date, gender_code, role_code, created_at, is_active, history_id, profile_id`,
        params
    );

    return result.rows[0] || null;
};

// PUT a user's activity by id
export const softDeleteUser = async (id) => {
    const result = await db.query(
        "UPDATE user_ SET is_active = false WHERE user_id = $1 RETURNING user_id",
        [id]
    );
    return result.rows[0] || null;
};

// DELETE a user by id
export const hardDeleteUser = async (id) => {
    const result = await db.query(
        "DELETE FROM user_ WHERE user_id = $1 RETURNING user_id",
        [id]
    );
    return result.rows[0] || null;
};
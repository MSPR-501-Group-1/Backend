import { db } from "../../db.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const SALT_ROUNDS = 10;

// GET all users
export const getUsers = async () => {
    const query = `
        SELECT user_id, email, first_name, last_name, birth_date, gender_code, role_type, created_at, is_active
        FROM user_
        WHERE 1=1
    `;

    const result = await db.query(query);
    return result.rows;
};

// GET a single user by id
export const getUserById = async (id) => {
    const query = `
        SELECT user_id, email, first_name, last_name, birth_date, gender_code, role_type, created_at, is_active
        FROM user_
        WHERE user_id = $1
    `;

    const result = await db.query(query, [id]);
    return result.rows[0] || null;
};

// POST a new user
export const createUser = async (data) => {
    const { email, password, first_name, last_name, birth_date, gender_code, role_type, is_active } = data;

    // Vérification si l'email existe déjà
    const existingUser = await db.query(
        "SELECT user_id FROM user_ WHERE email = $1",
        [email]
    );

    if (existingUser.rows.length > 0) {
        throw new Error("EMAIL_EXISTS");
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user_id = uuidv4();

    const result = await db.query(
        `INSERT INTO user_ (user_id, email, password_hash, first_name, last_name, birth_date, gender_code, role_type, created_at, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9)
         RETURNING user_id, email, first_name, last_name, birth_date, gender_code, role_type, created_at, is_active`,
        [
            user_id,
            email,
            password_hash,
            first_name,
            last_name,
            birth_date || null,
            gender_code || null,
            role_type || "FREEMIUM",
            is_active !== false,
        ]
    );

    return result.rows[0];
};

// PUT a user by id
export const updateUser = async (id, data) => {
    const allowedFields = ["email", "first_name", "last_name", "birth_date", "gender_code", "role_type", "is_active"];
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

    // Vérification de la disponibilité du nouvel email
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
         RETURNING user_id, email, first_name, last_name, birth_date, gender_code, role_type, created_at, is_active`,
        params
    );

    return result.rows[0] || null;
};

// Désactivation d'un utilisateur (soft delete)
export const softDeleteUser = async (id) => {
    const result = await db.query(
        "UPDATE user_ SET is_active = false WHERE user_id = $1 RETURNING user_id",
        [id]
    );
    return result.rows[0] || null;
};

// Suppression définitive d'un utilisateur (hard delete)
export const hardDeleteUser = async (id) => {
    const result = await db.query(
        "DELETE FROM user_ WHERE user_id = $1 RETURNING user_id",
        [id]
    );
    return result.rows[0] || null;
};
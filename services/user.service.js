import { db } from "../db.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const SALT_ROUNDS = 10; // Pour le cryptage de mot de passe

// GET all users
export const getUsers = async () => {

    const query = 
    `
        SELECT user_id, email, first_name, last_name, birth_date, gender_code, role_code, created_at, is_active 
        FROM user_ 
        WHERE 1=1
    `;

    const result = await db.query(query);

    return result.rows;
};

// GET a single user by id
export const getUserById = async (id) => {

    const query = `
        SELECT user_id, email, first_name, last_name, birth_date, gender_code, role_code, created_at, is_active 
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

    return result.rows[0] || null;
};

// PUT a user by id
export const updateUser = async (id, data) => {
    const allowedFields = ["email", "first_name", "last_name", "birth_date", "gender_code", "role_code", "is_active"];
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
         RETURNING user_id, email, first_name, last_name, birth_date, gender_code, role_code, created_at, is_active`,
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

// LOGIN - Log the user in (check email / password / account disabled)
export const login = async (email, password) => {
    const result = await db.query(
        "SELECT * FROM user_ WHERE email = $1",
        [email]
    );

    if (result.rows.length === 0) {
        throw new Error("INVALID_CREDENTIALS");
    }

    const user = result.rows[0];

    if (!user.is_active) {
        throw new Error("ACCOUNT_DISABLED");
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
        throw new Error("INVALID_CREDENTIALS");
    }

    return user;
};

// PUT - Change the user's password
export const changePassword = async (user_id, currentPassword, newPassword) => {
    const result = await db.query(
        "SELECT password_hash FROM user_ WHERE user_id = $1",
        [user_id]
    );

    if (result.rows.length === 0) {
        throw new Error("USER_NOT_FOUND");
    }

    const isValidPassword = await bcrypt.compare(currentPassword, result.rows[0].password_hash);

    if (!isValidPassword) {
        throw new Error("INVALID_PASSWORD");
    }

    const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await db.query(
        "UPDATE user_ SET password_hash = $1 WHERE user_id = $2",
        [newPasswordHash, user_id]
    );

    return true;
};

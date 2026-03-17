import { db } from "../../db.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

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
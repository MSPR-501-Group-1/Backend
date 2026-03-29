// Put the information of db connexion right here
import pg from "pg";

const { Pool } = pg;

const pickEnv = (...keys) => {
    for (const key of keys) {
        const value = process.env[key];
        if (value !== undefined && value !== "") {
            return value;
        }
    }
    return undefined;
};

export const db = new Pool({
    host: pickEnv("DB_HOST", "POSTGRES_HOST", "PGHOST", "localhost"),
    port: Number(pickEnv("DB_PORT", "POSTGRES_PORT", "PGPORT", "5432")),
    database: pickEnv("DB_NAME", "POSTGRES_DB", "PGDATABASE"),
    user: pickEnv("DB_USER", "POSTGRES_USER", "PGUSER"),
    password: pickEnv("DB_PASSWORD", "POSTGRES_PASSWORD", "PGPASSWORD")
});

// Test de connexion
db.query("SELECT NOW()")
    .then(() => console.log("DB connexion is successful"))
    .catch((err) => console.error("DB connexion is unsuccessful :", err.message));
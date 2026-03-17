// Put the information of db connexion right here
import pg from "pg";

const { Pool } = pg;

export const db = new Pool({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD
});

// Test de connexion
db.query("SELECT NOW()")
    .then(() => console.log("DB connexion is successful"))
    .catch((err) => console.error("DB connexion is unsuccessful :", err.message));
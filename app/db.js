// Put the information of db connexion right here

import pg from "pg";

const { Pool } = pg;

export const db = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || "testdb",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
});

// Test de connexion
db.query("SELECT NOW()")
    .then(() => console.log("DB connexion is successful"))
    .catch((err) => console.error("DB connexion is unsuccessful :", err.message));
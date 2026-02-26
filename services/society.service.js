import { db } from "../db.js";
import { v4 as uuidv4 } from "uuid";

export const getSocieties = async () => {
    const result = await db.query(`SELECT id_society, name FROM society`);
    return result.rows;
};

export const getSocietyById = async (id) => {
    const result = await db.query(`SELECT id_society, name FROM society WHERE id_society = $1`, [id]);
    return result.rows[0] || null;
};

export const createSociety = async (data) => {
    const { name } = data;
    const id_society = uuidv4();
    const result = await db.query(
        `INSERT INTO society (id_society, name) VALUES ($1,$2) RETURNING id_society, name`,
        [id_society, name || null]
    );
    return result.rows[0] || null;
};

export const updateSociety = async (id, data) => {
    const allowed = ["name"];
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
    const result = await db.query(`UPDATE society SET ${updates.join(", ")} WHERE id_society = $${idx} RETURNING id_society, name`, params);
    return result.rows[0] || null;
};

export const deleteSociety = async (id) => {
    const result = await db.query(`DELETE FROM society WHERE id_society = $1 RETURNING id_society`, [id]);
    return result.rows[0] || null;
};

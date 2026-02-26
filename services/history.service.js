import { db } from "../db.js";
import { v4 as uuidv4 } from "uuid";

export const getHistories = async () => {
    const result = await db.query(`SELECT id_history FROM history`);
    return result.rows;
};

export const getHistoryById = async (id) => {
    const result = await db.query(`SELECT id_history FROM history WHERE id_history = $1`, [id]);
    return result.rows[0] || null;
};

export const createHistory = async () => {
    const id_history = uuidv4();
    const result = await db.query(`INSERT INTO history (id_history) VALUES ($1) RETURNING id_history`, [id_history]);
    return result.rows[0] || null;
};

export const deleteHistory = async (id) => {
    const result = await db.query(`DELETE FROM history WHERE id_history = $1 RETURNING id_history`, [id]);
    return result.rows[0] || null;
};

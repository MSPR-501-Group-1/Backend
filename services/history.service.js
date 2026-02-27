import { db } from "../db.js";
import { v4 as uuidv4 } from "uuid";

export const getHistories = async () => {
    const result = await db.query(`SELECT history_id FROM history`);
    return result.rows;
};

export const getHistoryById = async (id) => {
    const result = await db.query(`SELECT history_id FROM history WHERE history_id = $1`, [id]);
    return result.rows[0] || null;
};

export const createHistory = async () => {
    const history_id = uuidv4();
    const result = await db.query(`INSERT INTO history (history_id) VALUES ($1) RETURNING history_id`, [history_id]);
    return result.rows[0] || null;
};

export const deleteHistory = async (id) => {
    const result = await db.query(`DELETE FROM history WHERE history_id = $1 RETURNING history_id`, [id]);
    return result.rows[0] || null;
};

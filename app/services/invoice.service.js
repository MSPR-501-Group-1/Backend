import { db } from "../db.js";
import { v4 as uuidv4 } from "uuid";

export const getInvoices = async () => {
    const result = await db.query(`
        SELECT invoice_id, user_id, subscription_id, issued_at, total_amount, status, pdf_url
        FROM invoice
    `);
    return result.rows;
};

export const getInvoiceById = async (id) => {
    const result = await db.query(
        `SELECT invoice_id, user_id, subscription_id, issued_at, total_amount, status, pdf_url
         FROM invoice WHERE invoice_id = $1`,
        [id]
    );
    return result.rows[0] || null;
};

export const createInvoice = async (data) => {
    const { user_id, subscription_id, issued_at, total_amount, status, pdf_url } = data;
    const invoice_id = uuidv4();
    const result = await db.query(
        `INSERT INTO invoice (invoice_id, user_id, subscription_id, issued_at, total_amount, status, pdf_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         RETURNING invoice_id, user_id, subscription_id, issued_at, total_amount, status, pdf_url`,
        [invoice_id, user_id, subscription_id || null, issued_at || null, total_amount, status || 'PENDING', pdf_url || null]
    );
    return result.rows[0] || null;
};

export const updateInvoice = async (id, data) => {
    const allowed = ["user_id", "subscription_id", "issued_at", "total_amount", "status", "pdf_url"];
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

    const result = await db.query(
        `UPDATE invoice SET ${updates.join(", ")} WHERE invoice_id = $${idx} RETURNING invoice_id, user_id, subscription_id, issued_at, total_amount, status, pdf_url`,
        params
    );
    return result.rows[0] || null;
};

export const deleteInvoice = async (id) => {
    const result = await db.query(`DELETE FROM invoice WHERE invoice_id = $1 RETURNING invoice_id`, [id]);
    return result.rows[0] || null;
};

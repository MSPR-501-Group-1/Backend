import { db } from "../db.js";
import { v4 as uuidv4 } from "uuid";

export const getPayments = async () => {
    const result = await db.query(`
        SELECT transaction_id, invoice_id, processed_at, amount, payment_method, transaction_ref_ext, status
        FROM payment_transaction
    `);
    return result.rows;
};

export const getPaymentById = async (id) => {
    const result = await db.query(
        `SELECT transaction_id, invoice_id, processed_at, amount, payment_method, transaction_ref_ext, status
         FROM payment_transaction WHERE transaction_id = $1`,
        [id]
    );
    return result.rows[0] || null;
};

export const createPayment = async (data) => {
    const { invoice_id, processed_at, amount, payment_method, transaction_ref_ext, status } = data;
    const transaction_id = uuidv4();
    const result = await db.query(
        `INSERT INTO payment_transaction (transaction_id, invoice_id, processed_at, amount, payment_method, transaction_ref_ext, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         RETURNING transaction_id, invoice_id, processed_at, amount, payment_method, transaction_ref_ext, status`,
        [transaction_id, invoice_id, processed_at || null, amount, payment_method || null, transaction_ref_ext || null, status || 'SUCCESS']
    );
    return result.rows[0] || null;
};

export const updatePayment = async (id, data) => {
    const allowed = ["invoice_id", "processed_at", "amount", "payment_method", "transaction_ref_ext", "status"];
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
        `UPDATE payment_transaction SET ${updates.join(", ")} WHERE transaction_id = $${idx} RETURNING transaction_id, invoice_id, processed_at, amount, payment_method, transaction_ref_ext, status`,
        params
    );
    return result.rows[0] || null;
};

export const deletePayment = async (id) => {
    const result = await db.query(`DELETE FROM payment_transaction WHERE transaction_id = $1 RETURNING transaction_id`, [id]);
    return result.rows[0] || null;
};

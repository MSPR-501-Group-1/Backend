import { db } from "../db.js";
import { v4 as uuidv4 } from "uuid";

export const getSubscriptions = async () => {
    const result = await db.query(`
        SELECT subscription_id, user_id, plan_id, start_date, end_date, status, auto_renew
        FROM subscription
    `);
    return result.rows;
};

export const getSubscriptionById = async (id) => {
    const result = await db.query(
        `SELECT subscription_id, user_id, plan_id, start_date, end_date, status, auto_renew
         FROM subscription WHERE subscription_id = $1`,
        [id]
    );
    return result.rows[0] || null;
};

export const createSubscription = async (data) => {
    const { user_id, plan_id, start_date, end_date, status, auto_renew } = data;
    const subscription_id = uuidv4();
    const result = await db.query(
        `INSERT INTO subscription (subscription_id, user_id, plan_id, start_date, end_date, status, auto_renew)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         RETURNING subscription_id, user_id, plan_id, start_date, end_date, status, auto_renew`,
        [subscription_id, user_id, plan_id, start_date, end_date || null, status || 'ACTIVE', auto_renew !== false]
    );
    return result.rows[0] || null;
};

export const updateSubscription = async (id, data) => {
    const allowed = ["user_id", "plan_id", "start_date", "end_date", "status", "auto_renew"];
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
        `UPDATE subscription SET ${updates.join(", ")} WHERE subscription_id = $${idx} RETURNING subscription_id, user_id, plan_id, start_date, end_date, status, auto_renew`,
        params
    );
    return result.rows[0] || null;
};

export const deleteSubscription = async (id) => {
    const result = await db.query(`DELETE FROM subscription WHERE subscription_id = $1 RETURNING subscription_id`, [id]);
    return result.rows[0] || null;
};
 

// Get all subscription plans
export const getSubscriptionPlans = async () => {
    const query = `
        SELECT plan_id, name, monthly_price, duration_months, features_json, is_active
        FROM subscription_plan
    `;

    const result = await db.query(query);
    return result.rows;
};

// Get one by id
export const getSubscriptionPlanById = async (id) => {
    const result = await db.query(
        `SELECT plan_id, name, monthly_price, duration_months, features_json, is_active
         FROM subscription_plan WHERE plan_id = $1`,
        [id]
    );
    return result.rows[0] || null;
};

// Create
export const createSubscriptionPlan = async (data) => {
    const { name, monthly_price, duration_months, features_json, is_active } = data;
    const plan_id = uuidv4();

    const result = await db.query(
        `INSERT INTO subscription_plan (plan_id, name, monthly_price, duration_months, features_json, is_active)
         VALUES ($1,$2,$3,$4,$5,$6)
         RETURNING plan_id, name, monthly_price, duration_months, features_json, is_active`,
        [plan_id, name, monthly_price, duration_months, features_json || {}, is_active !== false]
    );

    return result.rows[0] || null;
};

// Update
export const updateSubscriptionPlan = async (id, data) => {
    const allowed = ["name", "monthly_price", "duration_months", "features_json", "is_active"];
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
        `UPDATE subscription_plan SET ${updates.join(", ")} WHERE plan_id = $${idx} RETURNING plan_id, name, monthly_price, duration_months, features_json, is_active`,
        params
    );

    return result.rows[0] || null;
};

// Delete
export const deleteSubscriptionPlan = async (id) => {
    const result = await db.query(
        `DELETE FROM subscription_plan WHERE plan_id = $1 RETURNING plan_id`,
        [id]
    );
    return result.rows[0] || null;
};

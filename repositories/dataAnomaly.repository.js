import { db } from "../db.js";

const RANGE_INTERVALS = Object.freeze({
    "7d": "7 days",
    "30d": "30 days",
    "90d": "90 days",
});

const ANOMALY_BASE_SELECT = `
    SELECT
        da.anomaly_id,
        da.source_table,
        da.anomaly_table,
        da.field_name,
        da.record_identifier,
        da.original_value,
        da.detected_at,
        da.severity,
        COALESCE(da.is_resolved, FALSE) AS is_resolved,
        da.resolution_action,
        da.check_id,
        da.execution_id,
        dqc.check_type,
        dqc.check_rule,
        dqc.records_checked,
        dqc.records_failed,
        dqc.checked_at,
        dqc.status AS check_status,
        etl.name AS execution_name,
        etl.status AS execution_status,
        etl.started_at AS execution_started_at,
        etl.ended_at AS execution_ended_at
    FROM data_anomaly da
    LEFT JOIN data_quality_check_ dqc ON dqc.check_id = da.check_id
    LEFT JOIN etl_execution etl ON etl.execution_id = da.execution_id
`;

const buildListScope = ({ range, status, organizationId }) => {
    const conditions = [];
    const params = [];

    if (range !== "all") {
        params.push(RANGE_INTERVALS[range]);
        conditions.push(`da.detected_at >= now() - $${params.length}::interval`);
    }

    if (status === "open") {
        conditions.push("COALESCE(da.is_resolved, FALSE) = FALSE");
    }

    if (status === "resolved") {
        conditions.push("COALESCE(da.is_resolved, FALSE) = TRUE");
    }

    if (organizationId) {
        params.push(organizationId);
        const organizationParamIndex = params.length;

        conditions.push(`(
            lower(COALESCE(da.source_table, '')) = 'user_metrics'
            AND EXISTS (
                SELECT 1
                FROM user_metrics um
                JOIN user_organization uo ON uo.user_id = um.user_id
                WHERE um.metric_id = da.record_identifier
                  AND uo.organization_id = $${organizationParamIndex}
            )
        )`);
    }

    if (!conditions.length) {
        return {
            whereClause: "",
            params,
        };
    }

    return {
        whereClause: `WHERE ${conditions.join("\n      AND ")}`,
        params,
    };
};

export const listAnomalies = async ({ range, status, page, perPage, organizationId }, client = db) => {
    const offset = (page - 1) * perPage;
    const { whereClause, params } = buildListScope({ range, status, organizationId });

    const countResult = await client.query(
        `
            SELECT COUNT(*)::int AS total
            FROM data_anomaly da
            ${whereClause};
        `,
        params
    );

    const listParams = [...params, perPage, offset];
    const perPageParamIndex = params.length + 1;
    const offsetParamIndex = params.length + 2;

    const itemsResult = await client.query(
        `
            ${ANOMALY_BASE_SELECT}
            ${whereClause}
            ORDER BY da.detected_at DESC NULLS LAST, da.anomaly_id ASC
            LIMIT $${perPageParamIndex}
            OFFSET $${offsetParamIndex};
        `,
        listParams
    );

    return {
        total: Number(countResult.rows[0]?.total || 0),
        items: itemsResult.rows,
    };
};

export const findAnomalyById = async (anomalyId, client = db) => {
    const result = await client.query(
        `
            ${ANOMALY_BASE_SELECT}
            WHERE da.anomaly_id = $1;
        `,
        [anomalyId]
    );

    return result.rows[0] || null;
};

export const markAnomalyAsResolved = async ({ anomalyId, resolutionAction }, client = db) => {
    const result = await client.query(
        `
            UPDATE data_anomaly
            SET
                is_resolved = TRUE,
                resolution_action = $2
            WHERE anomaly_id = $1
            RETURNING anomaly_id;
        `,
        [anomalyId, resolutionAction]
    );

    return result.rows[0] || null;
};

export const insertCorrectionAuditLog = async ({ userId }, client = db) => {
    const result = await client.query(
        `
            INSERT INTO login_history (user_id, last_login)
            VALUES ($1, now())
            RETURNING last_login_id, user_id, last_login;
        `,
        [userId]
    );

    return result.rows[0] || null;
};

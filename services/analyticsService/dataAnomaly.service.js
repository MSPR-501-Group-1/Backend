import { db } from "../../db.js";
import * as dataAnomalyRepository from "../../repositories/dataAnomaly.repository.js";
import { replayDlqCorrections } from "../etlService/etl.service.js";
import { applyDlqCorrection } from "./dlqCsv.service.js";

const ALLOWED_RANGES = new Set(["7d", "30d", "90d", "all"]);
const ALLOWED_STATUSES = new Set(["open", "resolved", "all"]);

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 50;
const MAX_PER_PAGE = 200;
const RESOLUTION_ACTION_MAX_LENGTH = 50;
const DLQ_SUPPORTED_SOURCE_TABLES = new Set(["ingredient", "exercise"]);

const normalizeString = (value) => (typeof value === "string" ? value.trim() : "");

const normalizeCorrectedValue = (value) => {
    if (value === undefined || value === null) {
        return "";
    }

    if (typeof value === "string") {
        return value.trim();
    }

    if (typeof value === "number" || typeof value === "boolean") {
        return String(value);
    }

    throw createHttpError(400, "corrected_value doit etre une chaine, un nombre ou un booleen.");
};

const normalizeReplayFlag = (value) => {
    if (value === undefined || value === null || value === "") {
        return true;
    }

    if (typeof value === "boolean") {
        return value;
    }

    const normalized = String(value).trim().toLowerCase();
    if (normalized === "true") {
        return true;
    }

    if (normalized === "false") {
        return false;
    }

    throw createHttpError(400, "replay_now doit etre true ou false.");
};

const toIsoOrNull = (value) => {
    if (!value) return null;

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return null;
    }

    return parsed.toISOString();
};

const createHttpError = (status, message, details) => {
    const error = new Error(message);
    error.status = status;

    if (details !== undefined) {
        error.details = details;
    }

    return error;
};

const parsePositiveInteger = (rawValue, fallbackValue, fieldName) => {
    if (rawValue === undefined || rawValue === null || rawValue === "") {
        return fallbackValue;
    }

    const parsedValue = Number.parseInt(String(rawValue), 10);

    if (!Number.isFinite(parsedValue) || parsedValue < 1) {
        throw createHttpError(400, `Le parametre ${fieldName} doit etre un entier positif.`);
    }

    return parsedValue;
};

const normalizeListFilters = (rawQuery = {}) => {
    const requestedRange = normalizeString(rawQuery.range).toLowerCase() || "all";

    if (!ALLOWED_RANGES.has(requestedRange)) {
        throw createHttpError(400, "Le parametre range doit etre 7d, 30d, 90d ou all.");
    }

    const requestedStatus = normalizeString(rawQuery.status).toLowerCase() || "all";

    if (!ALLOWED_STATUSES.has(requestedStatus)) {
        throw createHttpError(400, "Le parametre status doit etre open, resolved ou all.");
    }

    const page = parsePositiveInteger(rawQuery.page, DEFAULT_PAGE, "page");
    const perPage = parsePositiveInteger(rawQuery.perPage, DEFAULT_PER_PAGE, "perPage");

    if (perPage > MAX_PER_PAGE) {
        throw createHttpError(400, `Le parametre perPage ne peut pas depasser ${MAX_PER_PAGE}.`);
    }

    const organizationId = normalizeString(rawQuery.organization_id) || null;

    return {
        range: requestedRange,
        status: requestedStatus,
        page,
        perPage,
        organizationId,
    };
};

const mapRowToAnomaly = (row) => ({
    anomaly_id: row.anomaly_id,
    source_table: row.source_table,
    field_name: row.field_name,
    record_identifier: row.record_identifier,
    original_value: row.original_value,
    detected_at: toIsoOrNull(row.detected_at),
    severity: row.severity,
    is_resolved: Boolean(row.is_resolved),
    resolution_action: row.resolution_action,
    check_id: row.check_id,
    execution_id: row.execution_id,
    extra: {
        anomaly_table: row.anomaly_table ?? null,
        check_type: row.check_type ?? null,
        check_rule: row.check_rule ?? null,
        records_checked: row.records_checked ?? null,
        records_failed: row.records_failed ?? null,
        checked_at: toIsoOrNull(row.checked_at),
        check_status: row.check_status ?? null,
        execution_name: row.execution_name ?? null,
        execution_status: row.execution_status ?? null,
        execution_started_at: toIsoOrNull(row.execution_started_at),
        execution_ended_at: toIsoOrNull(row.execution_ended_at),
        organization_scope:
            String(row.source_table || "").toLowerCase() === "user_metrics" ? "user_metrics" : "global",
    },
});

export const getAnomalies = async (rawQuery) => {
    const filters = normalizeListFilters(rawQuery);

    const { total, items } = await dataAnomalyRepository.listAnomalies(filters);

    return {
        items: items.map(mapRowToAnomaly),
        total,
        page: filters.page,
        perPage: filters.perPage,
    };
};

export const correctAnomaly = async ({
    anomalyId,
    resolutionAction,
    resolvedBy,
    requesterUserId,
    correctedValue,
    replayNow,
}) => {
    const normalizedAnomalyId = normalizeString(anomalyId);
    const normalizedResolutionAction = normalizeString(resolutionAction);
    const normalizedResolvedBy = normalizeString(resolvedBy);
    const normalizedCorrectedValue = normalizeCorrectedValue(correctedValue);
    const shouldReplayNow = normalizeReplayFlag(replayNow);

    if (!requesterUserId) {
        throw createHttpError(401, "Utilisateur non authentifie.");
    }

    if (!normalizedAnomalyId) {
        throw createHttpError(400, "Le parametre id est obligatoire.");
    }

    if (!normalizedResolutionAction) {
        throw createHttpError(400, "resolution_action est obligatoire.");
    }

    if (normalizedResolutionAction.length > RESOLUTION_ACTION_MAX_LENGTH) {
        throw createHttpError(400, `resolution_action depasse ${RESOLUTION_ACTION_MAX_LENGTH} caracteres.`);
    }

    if (!normalizedResolvedBy) {
        throw createHttpError(400, "resolved_by est obligatoire.");
    }

    if (normalizedResolvedBy !== requesterUserId) {
        throw createHttpError(403, "resolved_by doit correspondre a l'utilisateur authentifie.");
    }

    let replay = null;
    let replayError = null;
    let dlq = null;

    const client = await db.connect();

    try {
        await client.query("BEGIN");

        const existingAnomaly = await dataAnomalyRepository.findAnomalyById(normalizedAnomalyId, client);

        if (!existingAnomaly) {
            throw createHttpError(404, "Anomalie introuvable.");
        }

        const normalizedSourceTable = normalizeString(existingAnomaly.source_table).toLowerCase();
        const isDlqManaged = DLQ_SUPPORTED_SOURCE_TABLES.has(normalizedSourceTable);

        if (isDlqManaged) {
            if (!existingAnomaly.execution_id) {
                throw createHttpError(500, "execution_id manquant pour une anomalie ETL.");
            }

            if (!normalizedCorrectedValue) {
                throw createHttpError(
                    400,
                    "corrected_value est obligatoire pour les anomalies ETL rejouables."
                );
            }

            dlq = await applyDlqCorrection({
                sourceTable: normalizedSourceTable,
                executionId: existingAnomaly.execution_id,
                anomalyId: normalizedAnomalyId,
                fieldName: normalizeString(existingAnomaly.field_name),
                correctedValue: normalizedCorrectedValue,
                resolvedBy: normalizedResolvedBy,
            });
        }

        await dataAnomalyRepository.markAnomalyAsResolved(
            {
                anomalyId: normalizedAnomalyId,
                resolutionAction: normalizedResolutionAction,
            },
            client
        );

        await dataAnomalyRepository.insertCorrectionAuditLog({ userId: normalizedResolvedBy }, client);

        const updatedAnomaly = await dataAnomalyRepository.findAnomalyById(normalizedAnomalyId, client);

        await client.query("COMMIT");

        if (isDlqManaged && shouldReplayNow) {
            try {
                replay = await replayDlqCorrections({
                    sourceTable: normalizedSourceTable,
                    executionId: existingAnomaly.execution_id,
                });
            } catch (error) {
                replayError = error.message || "Erreur inconnue pendant le rejeu DLQ.";
            }
        }

        return {
            ...mapRowToAnomaly(updatedAnomaly),
            replay,
            replay_error: replayError,
            dlq,
        };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

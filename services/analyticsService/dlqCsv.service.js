import fs from "fs/promises";
import path from "path";

import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";

const DLQ_BASE_DIR = "/data/processed/dlq";

const toCell = (value) => {
    if (value === undefined || value === null) return "";
    return String(value);
};

const normalizeBooleanString = (value) => {
    return String(value || "").trim().toLowerCase() === "true" ? "true" : "false";
};

const getDlqPath = ({ sourceTable, executionId }) => {
    return path.join(DLQ_BASE_DIR, `${sourceTable}_${executionId}_dlq.csv`);
};

const readDlqRows = async (filePath) => {
    const rawCsv = await fs.readFile(filePath, "utf-8");
    return parse(rawCsv, {
        columns: true,
        skip_empty_lines: true,
        trim: false,
        bom: true,
    });
};

const writeDlqRows = async (filePath, rows) => {
    const csvText = stringify(rows, {
        header: true,
    });

    await fs.writeFile(filePath, csvText, "utf-8");
};

const updatePayloadWithCorrection = ({ payload, fieldName, correctedValue }) => {
    const nextPayload = { ...payload };
    nextPayload[fieldName] = correctedValue;
    return nextPayload;
};

export const applyDlqCorrection = async ({
    sourceTable,
    executionId,
    anomalyId,
    fieldName,
    correctedValue,
    resolvedBy,
}) => {
    const filePath = getDlqPath({ sourceTable, executionId });

    let rows;
    try {
        rows = await readDlqRows(filePath);
    } catch (error) {
        if (error.code === "ENOENT") {
            const notFoundError = new Error("DLQ file not found for this anomaly.");
            notFoundError.status = 404;
            throw notFoundError;
        }
        throw error;
    }

    const rowIndex = rows.findIndex((row) => String(row.anomaly_id || "") === anomalyId);
    if (rowIndex === -1) {
        const missingError = new Error("Anomaly row not found in DLQ file.");
        missingError.status = 404;
        throw missingError;
    }

    const row = rows[rowIndex];
    let payload;

    try {
        payload = JSON.parse(row.row_payload_json || "{}");
    } catch {
        const payloadError = new Error("Invalid DLQ payload JSON.");
        payloadError.status = 500;
        throw payloadError;
    }

    if (!fieldName || !Object.prototype.hasOwnProperty.call(payload, fieldName)) {
        const fieldError = new Error("Invalid anomaly field for DLQ correction.");
        fieldError.status = 400;
        throw fieldError;
    }

    const nowIso = new Date().toISOString();
    const nextPayload = updatePayloadWithCorrection({
        payload,
        fieldName,
        correctedValue,
    });

    row.corrected_value = toCell(correctedValue);
    row.row_payload_json = JSON.stringify(nextPayload);
    row.is_corrected = normalizeBooleanString(true);
    row.corrected_by = toCell(resolvedBy);
    row.corrected_at = nowIso;
    row.replay_status = "pending";
    row.replayed_at = "";
    row.last_error = "";

    rows[rowIndex] = row;
    await writeDlqRows(filePath, rows);

    return {
        filePath,
        anomalyId,
        sourceTable,
        executionId,
        correctedAt: nowIso,
    };
};

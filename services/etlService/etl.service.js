import { db } from "../../db.js";

// GET an etl pipeline batch by it's id
export const getEtlById = async (id) => {
    const result = await db.query(
        `SELECT execution_id as id, name, status, started_at, ended_at as completed_at, records_extracted, records_rejected as records_errors
         FROM etl_execution
         WHERE execution_id = $1`,
        [id]
    );

    return result.rows[0] || null;
};

// GET all etl executions with their status and info
export const getEtlExecutions = async () => {
    const result = await db.query(
        `SELECT execution_id as id, name, status, started_at, ended_at as completed_at, records_extracted, records_rejected as records_errors
         FROM etl_execution
         ORDER BY started_at DESC`
    );

    return result.rows;
};

// Launch an etl pipeline via the ETL API (/api/pipelines/:pipeline/transform). "Pipelines" is either nutrition or exercises for now.
export const launchEtlPipeline = async (pipeline) => {
    // Call the ETL API to launch the pipeline
    console.log(`Launching ETL pipeline: ${pipeline}`);

    const response = await fetch(`${process.env.ETL_API_URL}/api/pipelines/${pipeline}/transform`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to launch ETL pipeline: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
};

// Push ETL data to database (after transformation is done and batch is validated by the admin)
export const pushEtlData = async (id, pipeline) => {
    // Call the ETL API to push the data to the database
    console.log(`Pushing ETL data for execution ${id} and pipeline ${pipeline}`);
    const response = await fetch(`${process.env.ETL_API_URL}/api/pipelines/${pipeline}/load/${id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to push ETL data: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
};

// Update the status of an ETL execution
export const updateEtlStatus = async (id, status) => {
    const result = await db.query(
        `UPDATE etl_execution
         SET status = $2
         WHERE execution_id = $1
         RETURNING execution_id as id, name, status, started_at, ended_at as completed_at, records_extracted, records_rejected as records_errors`,
        [id, status.toUpperCase()]
    );

    return result.rows[0] || null;
};

// Modify the status of an ETL execution to "loaded" after the data has been successfully pushed to the database
export const markEtlAsLoaded = async (id) => {
    const result = await db.query(
        `UPDATE etl_execution
         SET status = 'LOADED'
         WHERE execution_id = $1
         RETURNING execution_id as id, name, status, started_at, ended_at as completed_at, records_extracted, records_rejected as records_errors`,
        [id]
    );

    return result.rows[0] || null;
};

// Modify the status of an ETL execution to "rejected" if the admin rejects the batch after transformation
export const markEtlAsRejected = async (id) => {
    const result = await db.query(
        `UPDATE etl_execution
         SET status = 'REJECTED'
         WHERE execution_id = $1
         RETURNING execution_id as id, name, status, started_at, ended_at as completed_at, records_extracted, records_rejected as records_errors`,
        [id]
    );

    return result.rows[0] || null;
};

// Delete an ETL execution record
export const deleteEtlExecution = async (id) => {
    const result = await db.query(
        `DELETE FROM etl_execution
         WHERE execution_id = $1
         RETURNING execution_id as id`,
        [id]
    );

    return result.rows[0] || null;
};
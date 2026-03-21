import { db } from "../../db.js";

// GET all users metrics
export const getAllUsersMetrics = async (range = '30d') => {

    // Accept only allowed ranges to avoid SQL injection
    const allowed = {
        '7d': "7 days",
        '30d': "30 days",
        '90d': "90 days",
    };

    const interval = allowed[range] ?? allowed['30d'];

    // Récupération du graphique minutes d'activité par jour (filtré)
    // total_minutes = SUM(duration in minutes) computed from end_at - start_at
    const activityMinutesQuery = `
        SELECT
            to_char((date_trunc('day', start_at) AT TIME ZONE 'UTC'), 'YYYY-MM-DD"T"00:00:00.000Z') AS jour,
            SUM(EXTRACT(EPOCH FROM (end_at - start_at)) / 60)::integer AS total_minutes
        FROM workout_session
        WHERE start_at IS NOT NULL
          AND end_at IS NOT NULL
          AND start_at >= now() - $1::interval
        GROUP BY (date_trunc('day', start_at) AT TIME ZONE 'UTC')
        ORDER BY jour DESC;
    `;

    const result = await db.query(activityMinutesQuery, [interval]);

    // Récupération de la moyenne du nombre de session par semaine (sur la période)
    const sessionQuery = `
        SELECT
            AVG(week_count)::numeric(10,2) AS avg_sessions_per_week
        FROM (
            SELECT date_trunc('week', start_at) AS week_start, COUNT(*) AS week_count
            FROM workout_session
            WHERE start_at IS NOT NULL
              AND start_at >= now() - $1::interval
            GROUP BY week_start
        ) t;
    `;

    const sessionResult = await db.query(sessionQuery, [interval]);

    // Récupération de la durée moyenne des sessions (sur la période)
    const averageDurationQuery = `
        SELECT
            AVG(EXTRACT(EPOCH FROM (end_at - start_at)) / 60) AS average_duration
        FROM workout_session
        WHERE start_at IS NOT NULL
          AND end_at IS NOT NULL
          AND start_at >= now() - $1::interval;
    `;

    const averageDurationResult = await db.query(averageDurationQuery, [interval]);

    // Répartition par catégorie d'exercice (nombre d'exercices par catégorie)
        const distributionQuery = `
                SELECT e.body_part_target AS category, COUNT(*)::integer AS count
                FROM workout_session_exercise wse
                JOIN workout_session ws ON wse.session_id = ws.session_id
                JOIN exercise e ON wse.exercise_id = e.exercise_id
                WHERE ws.start_at IS NOT NULL
                    AND ws.start_at >= now() - $1::interval
                GROUP BY e.body_part_target
                ORDER BY count DESC;
        `;

    const distributionResult = await db.query(distributionQuery, [interval]);

    return {
        dailyMetrics: result.rows,
        averageSessionsPerWeek: sessionResult.rows[0]?.avg_sessions_per_week ?? null,
        averageDuration: averageDurationResult.rows[0]?.average_duration ?? null,
        distribution: distributionResult.rows,
    };
};
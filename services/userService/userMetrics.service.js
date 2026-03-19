import { db } from "../../db.js";

// GET all users metrics
export const getAllUsersMetrics = async () => {

    // Récupération du graphique minutes d'activité par jour
    const activityMinutesQuery = `
        SELECT 
            DATE(start_time) AS jour,
            SUM(duration_time) AS total_minutes
            FROM workout_session
            GROUP BY DATE(start_time)
            ORDER BY jour DESC;
    `;

    const result = await db.query(activityMinutesQuery);

    // Récupération de la moyenne du nombre de session par semaine
    const sessionQuery = `
        SELECT 
            AVG(week_count)::numeric(10,2) AS avg_sessions_per_week
            FROM (
                SELECT date_trunc('week', start_time) AS week_start, COUNT(*) AS week_count
                FROM workout_session
                WHERE start_time IS NOT NULL
                GROUP BY week_start
        ) t;
    `;

    const sessionResult = await db.query(sessionQuery);

    // Récupération de la durée moyenne des sessions
    const averageDurationQuery = `
        SELECT 
            AVG(duration_time) AS average_duration
            FROM workout_session;
    `;

    const averageDurationResult = await db.query(averageDurationQuery);

    return {
        dailyMetrics: result.rows,
        averageSessionsPerWeek: sessionResult.rows[0].avg_sessions_per_week,
        averageDuration: averageDurationResult.rows[0].average_duration
    };
};
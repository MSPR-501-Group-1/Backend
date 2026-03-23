import { db } from "../../db.js";
import {
    RANGE_INTERVALS,
    normalizeRange,
    hasBoundedRange,
    trendForVolume,
    currentWindowSql,
    previousWindowSql,
} from "../analyticsService/analytics.utils.js";

// GET fitness metrics for analytics pages
export const getFitnessMetrics = async (range = '30d') => {
    const normalizedRange = normalizeRange(range, '30d');
    const hasDateFilter = hasBoundedRange(normalizedRange);
    const interval = RANGE_INTERVALS[normalizedRange];
    const rangeDays = normalizedRange === '7d' ? 7 : normalizedRange === '30d' ? 30 : normalizedRange === '90d' ? 90 : null;
    const intervalParams = hasDateFilter ? [interval] : [];
    const sessionParams = hasDateFilter ? [interval, rangeDays] : [];

    const dateFilter = currentWindowSql('start_at', normalizedRange);
    const dateFilterWs = currentWindowSql('ws.start_at', normalizedRange);

    // Récupération du graphique minutes d'activité par jour (filtré)
    // total_minutes = SUM(duration in minutes) computed from end_at - start_at
    const activityMinutesQuery = `
        SELECT
            to_char((date_trunc('day', start_at) AT TIME ZONE 'UTC'), 'YYYY-MM-DD"T"00:00:00.000Z') AS jour,
            SUM(EXTRACT(EPOCH FROM (end_at - start_at)) / 60)::integer AS total_minutes
        FROM workout_session
        WHERE start_at IS NOT NULL
          AND end_at IS NOT NULL
          ${dateFilter}
        GROUP BY (date_trunc('day', start_at) AT TIME ZONE 'UTC')
        ORDER BY jour DESC;
    `;

    const result = await db.query(activityMinutesQuery, intervalParams);

    // For bounded ranges, compute a true rolling weekly rate to avoid partial ISO week bias.
    const sessionQuery = hasDateFilter
        ? `
            SELECT
                ROUND((COUNT(*)::numeric / NULLIF($2::numeric, 0)) * 7, 2) AS avg_sessions_per_week
            FROM workout_session
            WHERE start_at IS NOT NULL
              ${dateFilter};
        `
        : `
            SELECT
                AVG(week_count)::numeric(10,2) AS avg_sessions_per_week
            FROM (
                SELECT date_trunc('week', start_at) AS week_start, COUNT(*) AS week_count
                FROM workout_session
                WHERE start_at IS NOT NULL
                GROUP BY week_start
            ) t;
        `;

    const sessionResult = await db.query(sessionQuery, sessionParams);

    // Récupération de la durée moyenne des sessions (sur la période)
    const averageDurationQuery = `
        SELECT
            AVG(EXTRACT(EPOCH FROM (end_at - start_at)) / 60) AS average_duration
        FROM workout_session
        WHERE start_at IS NOT NULL
          AND end_at IS NOT NULL
                    ${dateFilter};
    `;

    const averageDurationResult = await db.query(averageDurationQuery, intervalParams);

    // Répartition par catégorie d'exercice (nombre d'exercices par catégorie)
    const distributionQuery = `
                SELECT e.body_part_target AS category, COUNT(*)::integer AS count
                FROM workout_session_exercise wse
                JOIN workout_session ws ON wse.session_id = ws.session_id
                JOIN exercise e ON wse.exercise_id = e.exercise_id
                WHERE ws.start_at IS NOT NULL
                    ${dateFilterWs}
                GROUP BY e.body_part_target
                ORDER BY count DESC;
        `;

    const distributionResult = await db.query(distributionQuery, intervalParams);

    let previousAverageSessionsPerWeek = null;
    let previousAverageDuration = null;
    let previousTotalMinutes = null;

    if (hasDateFilter) {
        const previousSessionQuery = `
            SELECT
                ROUND((COUNT(*)::numeric / NULLIF($2::numeric, 0)) * 7, 2) AS avg_sessions_per_week
            FROM workout_session
            WHERE start_at IS NOT NULL
              ${previousWindowSql('start_at', normalizedRange)};
        `;

        const previousAverageDurationQuery = `
            SELECT
                AVG(EXTRACT(EPOCH FROM (end_at - start_at)) / 60) AS average_duration
            FROM workout_session
            WHERE start_at IS NOT NULL
              AND end_at IS NOT NULL
              ${previousWindowSql('start_at', normalizedRange)};
        `;

        const previousTotalMinutesQuery = `
            SELECT
                COALESCE(SUM(EXTRACT(EPOCH FROM (end_at - start_at)) / 60), 0) AS total_minutes
            FROM workout_session
            WHERE start_at IS NOT NULL
              AND end_at IS NOT NULL
              ${previousWindowSql('start_at', normalizedRange)};
        `;

        const [prevSessions, prevDuration, prevMinutes] = await Promise.all([
            db.query(previousSessionQuery, sessionParams),
            db.query(previousAverageDurationQuery, intervalParams),
            db.query(previousTotalMinutesQuery, intervalParams),
        ]);

        previousAverageSessionsPerWeek = prevSessions.rows[0]?.avg_sessions_per_week ?? null;
        previousAverageDuration = prevDuration.rows[0]?.average_duration ?? null;
        previousTotalMinutes = prevMinutes.rows[0]?.total_minutes ?? null;
    }

    const currentAverageSessionsPerWeek = sessionResult.rows[0]?.avg_sessions_per_week ?? null;
    const currentAverageDuration = averageDurationResult.rows[0]?.average_duration ?? null;
    const currentTotalMinutes = result.rows.reduce((sum, row) => sum + Number(row.total_minutes ?? 0), 0);

    return {
        dailyMetrics: result.rows,
        averageSessionsPerWeek: currentAverageSessionsPerWeek,
        averageSessionsPerWeekTrend: trendForVolume(
            normalizedRange,
            currentAverageSessionsPerWeek,
            previousAverageSessionsPerWeek
        ),
        previousAverageSessionsPerWeek: hasDateFilter
            ? Number(previousAverageSessionsPerWeek ?? 0)
            : null,
        averageDuration: currentAverageDuration,
        averageDurationTrend: trendForVolume(
            normalizedRange,
            currentAverageDuration,
            previousAverageDuration
        ),
        previousAverageDuration: hasDateFilter
            ? Number(previousAverageDuration ?? 0)
            : null,
        totalMinutes: currentTotalMinutes,
        totalMinutesTrend: trendForVolume(
            normalizedRange,
            currentTotalMinutes,
            previousTotalMinutes
        ),
        previousTotalMinutes: hasDateFilter
            ? Number(previousTotalMinutes ?? 0)
            : null,
        distribution: distributionResult.rows,
    };
};

// Backward-compatible alias used by the existing /usersMetrics route.
export const getAllUsersMetrics = async (range = '30d') => getFitnessMetrics(range);
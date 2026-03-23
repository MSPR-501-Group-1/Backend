import { db } from "../../db.js";
import {
    RANGE_INTERVALS,
    RANGE_DAYS,
    normalizeRange,
    hasBoundedRange,
    round1,
    safePercent,
    trendForVolume,
    trendForRate,
    currentWindowSql,
    previousWindowSql,
} from "./analytics.utils.js";

const PALETTE = ["#2563EB", "#7C3AED", "#16A34A", "#F59E0B", "#DC2626"];

const monthLabel = (dateLike) => {
    const d = new Date(dateLike);
    return d.toLocaleString("fr-FR", { month: "short" });
};

const activeUsersLabel = (range) => {
    if (range === '7d') return 'Utilisateurs actifs / semaine';
    if (range === '90d') return 'Utilisateurs actifs / trimestre';
    return 'Utilisateurs actifs / mois';
};

export const getBusinessKpis = async (range = '30d') => {
    const normalizedRange = normalizeRange(range, '30d');
    const hasRange = hasBoundedRange(normalizedRange);
    const interval = RANGE_INTERVALS[normalizedRange];
    const rangeDays = RANGE_DAYS[normalizedRange] ?? 30;
    const params = hasRange ? [interval] : [];

    const loginFilterCurrent = currentWindowSql('last_login', normalizedRange);
    const loginFilterPrevious = previousWindowSql('last_login', normalizedRange);
    const workoutFilterCurrent = currentWindowSql('ws.start_at', normalizedRange);
    const workoutFilterPrevious = previousWindowSql('ws.start_at', normalizedRange);

    const dauSeriesQuery = hasRange
        ? `
            WITH days AS (
                SELECT generate_series(current_date - ($1::int - 1), current_date, interval '1 day')::date AS day
            ),
            counts AS (
                SELECT date(last_login) AS day, COUNT(DISTINCT user_id)::int AS value
                FROM login_history
                WHERE last_login >= current_date - ($1::int - 1)
                  AND last_login <= now()
                GROUP BY date(last_login)
            )
            SELECT to_char(days.day, 'YYYY-MM-DD') AS date,
                     COALESCE(counts.value, 0)::int AS value
            FROM days
            LEFT JOIN counts ON counts.day = days.day
            ORDER BY days.day;
        `
        : `
            WITH bounds AS (
                SELECT
                    COALESCE(MIN(date(last_login)), current_date) AS min_day,
                    COALESCE(MAX(date(last_login)), current_date) AS max_day
                FROM login_history
            ),
            days AS (
                SELECT generate_series(min_day, max_day, interval '1 day')::date AS day
                FROM bounds
            ),
            counts AS (
                SELECT date(last_login) AS day, COUNT(DISTINCT user_id)::int AS value
                FROM login_history
                GROUP BY date(last_login)
            )
            SELECT to_char(days.day, 'YYYY-MM-DD') AS date,
                   COALESCE(counts.value, 0)::int AS value
            FROM days
            LEFT JOIN counts ON counts.day = days.day
            ORDER BY days.day;
        `;
    const dauSeriesParams = hasRange
        ? [rangeDays]
        : [];

    const [
        dauSeriesResult,
        mauResult,
        prevMauResult,
        retentionResult,
        prevRetentionResult,
        engagementResult,
        prevEngagementResult,
        churnResult,
        prevChurnResult,
        currentSessionsResult,
        previousSessionsResult,
        roleMixResult,
        goalAdoptionResult,
        monthlyUsersResult,
    ] = await Promise.all([
        db.query(dauSeriesQuery, dauSeriesParams),
        db.query(`
            SELECT COUNT(DISTINCT user_id)::int AS value
            FROM login_history
                        WHERE 1=1
                            ${loginFilterCurrent};
                `, params),
        db.query(`
            SELECT COUNT(DISTINCT user_id)::int AS value
            FROM login_history
                        WHERE 1=1
                            ${loginFilterPrevious};
                `, params),
        db.query(`
            WITH eligible AS (
                SELECT user_id
                FROM user_
                                WHERE created_at <= now() - ${hasRange ? '$1::interval' : "interval '30 days'"}
            ),
            retained AS (
                SELECT DISTINCT lh.user_id
                FROM login_history lh
                JOIN eligible e ON e.user_id = lh.user_id
                                WHERE 1=1
                                    ${currentWindowSql('lh.last_login', normalizedRange)}
            )
            SELECT
                (SELECT COUNT(*) FROM retained)::numeric AS retained_count,
                (SELECT COUNT(*) FROM eligible)::numeric AS eligible_count;
                `, params),
        db.query(`
            WITH eligible AS (
                SELECT user_id
                FROM user_
                                WHERE created_at <= now() - ${hasRange ? '($1::interval * 2)' : "interval '60 days'"}
            ),
            retained AS (
                SELECT DISTINCT lh.user_id
                FROM login_history lh
                JOIN eligible e ON e.user_id = lh.user_id
                                WHERE 1=1
                                    ${previousWindowSql('lh.last_login', normalizedRange)}
            )
            SELECT
                (SELECT COUNT(*) FROM retained)::numeric AS retained_count,
                (SELECT COUNT(*) FROM eligible)::numeric AS eligible_count;
                `, params),
        db.query(`
            WITH active_users AS (
                SELECT DISTINCT user_id
                FROM login_history
                                WHERE 1=1
                                    ${loginFilterCurrent}
            ),
            engaged_users AS (
                SELECT DISTINCT au.user_id
                FROM active_users au
                                JOIN workout_session ws ON ws.user_id = au.user_id
                                WHERE 1=1
                                    ${workoutFilterCurrent}
            )
            SELECT
                (SELECT COUNT(*) FROM engaged_users)::numeric AS engaged_count,
                (SELECT COUNT(*) FROM active_users)::numeric AS active_count;
                `, params),
        db.query(`
            WITH active_users AS (
                SELECT DISTINCT user_id
                FROM login_history
                                WHERE 1=1
                                    ${loginFilterPrevious}
            ),
            engaged_users AS (
                SELECT DISTINCT au.user_id
                FROM active_users au
                                JOIN workout_session ws ON ws.user_id = au.user_id
                                WHERE 1=1
                                    ${workoutFilterPrevious}
            )
            SELECT
                (SELECT COUNT(*) FROM engaged_users)::numeric AS engaged_count,
                (SELECT COUNT(*) FROM active_users)::numeric AS active_count;
                `, params),
        db.query(`
            WITH users_seen_before AS (
                SELECT DISTINCT user_id
                FROM login_history
                WHERE last_login < now() - ${hasRange ? '$1::interval' : "interval '30 days'"}
            ),
            active_recent AS (
                SELECT DISTINCT user_id
                FROM login_history
                WHERE 1=1
                  ${loginFilterCurrent}
            )
            SELECT
                (SELECT COUNT(*) FROM users_seen_before)::numeric AS baseline_count,
                (
                    SELECT COUNT(*)
                    FROM users_seen_before usb
                    LEFT JOIN active_recent ar ON ar.user_id = usb.user_id
                    WHERE ar.user_id IS NULL
                )::numeric AS churned_count;
                `, params),
        db.query(`
            WITH users_seen_before AS (
                SELECT DISTINCT user_id
                FROM login_history
                                WHERE last_login < now() - ${hasRange ? '($1::interval * 2)' : "interval '60 days'"}
            ),
            active_window AS (
                SELECT DISTINCT user_id
                FROM login_history
                                WHERE 1=1
                                    ${loginFilterPrevious}
            )
            SELECT
                (SELECT COUNT(*) FROM users_seen_before)::numeric AS baseline_count,
                (
                    SELECT COUNT(*)
                    FROM users_seen_before usb
                    LEFT JOIN active_window aw ON aw.user_id = usb.user_id
                    WHERE aw.user_id IS NULL
                )::numeric AS churned_count;
        `, params),
        db.query(`
            SELECT COUNT(*)::numeric AS sessions_count
            FROM workout_session ws
            WHERE 1=1
              ${workoutFilterCurrent};
        `, params),
        db.query(`
            SELECT COUNT(*)::numeric AS sessions_count
            FROM workout_session ws
            WHERE 1=1
              ${workoutFilterPrevious};
        `, params),
        db.query(`
            WITH active_users AS (
                SELECT DISTINCT lh.user_id
                FROM login_history lh
                WHERE 1=1
                  ${currentWindowSql('lh.last_login', normalizedRange)}
            ),
            role_counts AS (
                SELECT
                    r.role_type AS role,
                    COUNT(*)::numeric AS cnt
                FROM active_users au
                JOIN user_ u ON u.user_id = au.user_id
                JOIN role r ON r.role_id = u.role_id
                GROUP BY r.role_type
            ),
            total AS (
                SELECT COALESCE(SUM(cnt), 0)::numeric AS total_cnt FROM role_counts
            )
            SELECT
                role_counts.role,
                CASE
                    WHEN total.total_cnt = 0 THEN 0
                    ELSE ROUND((role_counts.cnt / total.total_cnt) * 100, 1)
                END AS share
            FROM role_counts, total
            ORDER BY share DESC;
        `, params),
        db.query(`
            WITH active_users AS (
                SELECT DISTINCT lh.user_id
                FROM login_history lh
                WHERE 1=1
                  ${currentWindowSql('lh.last_login', normalizedRange)}
            ),
            counts AS (
                SELECT
                    hg.label AS goal,
                    COUNT(*)::numeric AS cnt
                FROM active_users au
                JOIN user_health_goal uhg ON uhg.user_id = au.user_id
                JOIN health_goal hg ON hg.goal_id = uhg.goal_id
                GROUP BY hg.label
            ),
            total AS (
                SELECT COALESCE(SUM(cnt), 0)::numeric AS total_cnt FROM counts
            )
            SELECT
                counts.goal,
                CASE
                    WHEN total.total_cnt = 0 THEN 0
                    ELSE ROUND((counts.cnt / total.total_cnt) * 100, 1)
                END AS share
            FROM counts, total
            ORDER BY share DESC
            LIMIT 6;
        `, params),
        db.query(`
            WITH months AS (
                SELECT generate_series(
                    date_trunc('month', now()) - interval '5 months',
                    date_trunc('month', now()),
                    interval '1 month'
                ) AS month_start
            ),
            new_users AS (
                SELECT
                    m.month_start,
                    COUNT(u.user_id)::int AS value
                FROM months m
                LEFT JOIN user_ u
                  ON u.created_at >= m.month_start
                 AND u.created_at < (m.month_start + interval '1 month')
                GROUP BY m.month_start
            ),
            active_users AS (
                SELECT
                    m.month_start,
                    COUNT(DISTINCT lh.user_id)::int AS value
                FROM months m
                LEFT JOIN login_history lh
                  ON lh.last_login >= m.month_start
                 AND lh.last_login < (m.month_start + interval '1 month')
                GROUP BY m.month_start
            )
            SELECT
                to_char(m.month_start, 'YYYY-MM-DD') AS month,
                COALESCE(au.value, 0)::int AS active,
                COALESCE(nu.value, 0)::int AS new_users
            FROM months m
            LEFT JOIN active_users au ON au.month_start = m.month_start
            LEFT JOIN new_users nu ON nu.month_start = m.month_start
            ORDER BY month;
        `),
    ]);

    const engagementTrend = dauSeriesResult.rows.map((row) => ({
        date: row.date,
        value: Number(row.value || 0),
    }));

    const currentDauAvg = engagementTrend.length
        ? engagementTrend.reduce((sum, item) => sum + item.value, 0) / engagementTrend.length
        : 0;

    let previousDauAvg = null;
    if (hasRange) {
        const previousDauResult = await db.query(`
            WITH days AS (
                SELECT generate_series(
                    current_date - (($1::int * 2) - 1),
                    current_date - $1::int,
                    interval '1 day'
                )::date AS day
            ),
            counts AS (
                SELECT date(last_login) AS day, COUNT(DISTINCT user_id)::int AS value
                FROM login_history
                WHERE last_login >= current_date - (($1::int * 2) - 1)
                  AND last_login < current_date - $1::int
                GROUP BY date(last_login)
            )
            SELECT AVG(COALESCE(counts.value, 0))::numeric AS value
            FROM days
            LEFT JOIN counts ON counts.day = days.day;
        `, [rangeDays]);
        previousDauAvg = Number(previousDauResult.rows[0]?.value || 0);
    }

    const mau = Number(mauResult.rows[0]?.value || 0);
    const previousMau = Number(prevMauResult.rows[0]?.value || 0);
    let mauDisplay = mau;

    if (!hasRange) {
        const mauHistoricalAvgResult = await db.query(`
            WITH monthly_active AS (
                SELECT
                    date_trunc('month', last_login) AS month_start,
                    COUNT(DISTINCT user_id)::numeric AS active_users
                FROM login_history
                GROUP BY date_trunc('month', last_login)
            )
            SELECT ROUND(COALESCE(AVG(active_users), 0), 1) AS value
            FROM monthly_active;
        `);
        mauDisplay = Number(mauHistoricalAvgResult.rows[0]?.value || 0);
    }

    const retention = round1(
        safePercent(retentionResult.rows[0]?.retained_count, retentionResult.rows[0]?.eligible_count)
    );
    const previousRetention = round1(
        safePercent(prevRetentionResult.rows[0]?.retained_count, prevRetentionResult.rows[0]?.eligible_count)
    );

    const engagement = round1(
        safePercent(engagementResult.rows[0]?.engaged_count, engagementResult.rows[0]?.active_count)
    );
    const previousEngagement = round1(
        safePercent(prevEngagementResult.rows[0]?.engaged_count, prevEngagementResult.rows[0]?.active_count)
    );

    const churn = round1(
        safePercent(churnResult.rows[0]?.churned_count, churnResult.rows[0]?.baseline_count)
    );
    const previousChurn = round1(
        safePercent(prevChurnResult.rows[0]?.churned_count, prevChurnResult.rows[0]?.baseline_count)
    );

    const currentSessionsCount = Number(currentSessionsResult.rows[0]?.sessions_count || 0);
    const previousSessionsCount = Number(previousSessionsResult.rows[0]?.sessions_count || 0);
    const currentActiveCount = Number(engagementResult.rows[0]?.active_count || 0);
    const previousActiveCount = Number(prevEngagementResult.rows[0]?.active_count || 0);
    const sessionsPerActive = currentActiveCount > 0
        ? round1(currentSessionsCount / currentActiveCount)
        : 0;
    const previousSessionsPerActive = previousActiveCount > 0
        ? round1(previousSessionsCount / previousActiveCount)
        : 0;

    const kpis = [
        {
            id: "dau",
            label: "Utilisateurs actifs / jour",
            description: "Moyenne des utilisateurs uniques connectes par jour sur la periode.",
            value: round1(currentDauAvg),
            comparedValue: hasRange ? round1(previousDauAvg ?? 0) : null,
            trend: trendForVolume(normalizedRange, currentDauAvg, previousDauAvg),
            trendUnit: "%",
            status: "success",
        },
        {
            id: "mau",
            label: activeUsersLabel(normalizedRange),
            description: hasRange
                ? "Nombre d'utilisateurs uniques actifs sur la fenetre selectionnee."
                : "Moyenne historique des utilisateurs actifs mensuels.",
            value: mauDisplay,
            comparedValue: hasRange ? previousMau : null,
            trend: trendForVolume(normalizedRange, mauDisplay, previousMau),
            trendUnit: "%",
            status: "success",
        },
        {
            id: "sessions-per-active",
            label: "Sessions / actif",
            description: "Nombre moyen de sessions workout par utilisateur actif sur la fenetre.",
            value: sessionsPerActive,
            unit: "sess",
            comparedValue: hasRange ? previousSessionsPerActive : null,
            comparedUnit: hasRange ? "sess" : undefined,
            trend: trendForVolume(normalizedRange, sessionsPerActive, previousSessionsPerActive),
            trendUnit: "%",
            status: "success",
        },
        {
            id: "retention-30",
            label: "Retention J+30",
            description: "Part des utilisateurs eligibles revenus actifs sur la fenetre courante.",
            value: hasRange ? retention : "N/A",
            unit: hasRange ? "%" : undefined,
            comparedValue: hasRange ? previousRetention : null,
            comparedUnit: hasRange ? "%" : undefined,
            trend: hasRange ? trendForRate(normalizedRange, retention, previousRetention) : null,
            trendUnit: hasRange ? "pts" : undefined,
            status: "success",
        },
        {
            id: "engagement",
            label: "Taux d'engagement",
            description: "Part des utilisateurs actifs ayant effectue au moins une session workout.",
            value: hasRange ? engagement : "N/A",
            unit: hasRange ? "%" : undefined,
            comparedValue: hasRange ? previousEngagement : null,
            comparedUnit: hasRange ? "%" : undefined,
            trend: hasRange ? trendForRate(normalizedRange, engagement, previousEngagement) : null,
            trendUnit: hasRange ? "pts" : undefined,
            status: "success",
        },
        {
            id: "churn",
            label: "Taux de churn",
            description: "Part des utilisateurs historiques non revenus actifs sur la fenetre.",
            value: hasRange ? churn : "N/A",
            unit: hasRange ? "%" : undefined,
            comparedValue: hasRange ? previousChurn : null,
            comparedUnit: hasRange ? "%" : undefined,
            trend: hasRange ? trendForRate(normalizedRange, churn, previousChurn) : null,
            trendUnit: hasRange ? "pts" : undefined,
            trendPositiveIsGood: false,
            status: "success",
        },
    ];

    const retentionCohorts = roleMixResult.rows.map((row, index) => ({
        name: String(row.role || "AUTRE"),
        value: Number(row.share || 0),
        color: PALETTE[index % PALETTE.length],
    }));

    const featureAdoption = goalAdoptionResult.rows.map((row, index) => ({
        name: String(row.goal || "Autre"),
        value: Number(row.share || 0),
        color: PALETTE[index % PALETTE.length],
    }));

    const revenueVsTarget = monthlyUsersResult.rows.map((row) => ({
        date: monthLabel(row.month),
        active: Number(row.active || 0),
        newUsers: Number(row.new_users || 0),
    }));

    return {
        kpis,
        engagementTrend,
        retentionCohorts,
        featureAdoption,
        revenueVsTarget,
    };
};

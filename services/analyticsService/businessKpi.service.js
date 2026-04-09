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

const toNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const activeUsersLabel = (range) => {
    if (range === '7d') return 'Utilisateurs actifs / semaine';
    if (range === '90d') return 'Utilisateurs actifs / trimestre';
    return 'Utilisateurs actifs / mois';
};

const PARTNER_ACTIVITY_WINDOW_DAYS = 30;
const PARTNER_ACTIVITY_INTERVAL_SQL = `${PARTNER_ACTIVITY_WINDOW_DAYS} days`;

const toIsoOrNull = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
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

export const getNutritionAnalytics = async (range = '30d') => {
    const normalizedRange = normalizeRange(range, '30d');
    const hasRange = hasBoundedRange(normalizedRange);
    const interval = RANGE_INTERVALS[normalizedRange];
    const params = hasRange ? [interval] : [];

    const mealFilterCurrent = currentWindowSql('m.consumed_at', normalizedRange);
    const mealFilterPrevious = previousWindowSql('m.consumed_at', normalizedRange);

    const nutritionAggregateQuery = (dateFilterSql) => `
        WITH base_meals AS (
            SELECT
                m.meal_id,
                m.consumed_at,
                COALESCE(m.calories_consumed, 0)::numeric AS calories
            FROM meal m
            WHERE m.consumed_at IS NOT NULL
              ${dateFilterSql}
        ),
        meal_stats AS (
            SELECT
                COUNT(*)::numeric AS meals_count,
                COUNT(DISTINCT date(consumed_at))::numeric AS active_days,
                COALESCE(SUM(calories), 0)::numeric AS total_calories
            FROM base_meals
        ),
        macro_stats AS (
            SELECT
                COALESCE(SUM((COALESCE(i.protein_g, 0)::numeric * COALESCE(mi.quantity, 0)::numeric) / 100), 0)::numeric AS protein_g,
                COALESCE(SUM((COALESCE(i.carbs_g, 0)::numeric * COALESCE(mi.quantity, 0)::numeric) / 100), 0)::numeric AS carbs_g,
                COALESCE(SUM((COALESCE(i.fat_g, 0)::numeric * COALESCE(mi.quantity, 0)::numeric) / 100), 0)::numeric AS fat_g
            FROM meal m
            JOIN meal_ingredient mi ON mi.meal_id = m.meal_id
            JOIN ingredient i ON i.ingredient_id = mi.ingredient_id
            WHERE m.consumed_at IS NOT NULL
              ${dateFilterSql}
        )
        SELECT
            meal_stats.meals_count,
            meal_stats.active_days,
            meal_stats.total_calories,
            CASE
                WHEN meal_stats.active_days = 0 THEN 0
                ELSE ROUND(meal_stats.total_calories / meal_stats.active_days, 1)
            END AS avg_daily_calories,
            CASE
                WHEN meal_stats.meals_count = 0 THEN 0
                ELSE ROUND(meal_stats.total_calories / meal_stats.meals_count, 1)
            END AS avg_calories_per_meal,
            ROUND(macro_stats.protein_g, 1) AS protein_g,
            ROUND(macro_stats.carbs_g, 1) AS carbs_g,
            ROUND(macro_stats.fat_g, 1) AS fat_g
        FROM meal_stats
        CROSS JOIN macro_stats;
    `;

    const [timeSeriesResult, currentAggResult, previousAggResult, distributionResult] = await Promise.all([
        db.query(`
            SELECT
                to_char(date_trunc('day', m.consumed_at), 'YYYY-MM-DD') AS date,
                ROUND(SUM(COALESCE(m.calories_consumed, 0))::numeric, 1) AS value
            FROM meal m
            WHERE m.consumed_at IS NOT NULL
              ${mealFilterCurrent}
            GROUP BY date_trunc('day', m.consumed_at)
            ORDER BY date;
        `, params),
        db.query(nutritionAggregateQuery(mealFilterCurrent), params),
        hasRange
            ? db.query(nutritionAggregateQuery(mealFilterPrevious), params)
            : Promise.resolve({ rows: [] }),
        db.query(`
            SELECT
                CASE
                    WHEN EXTRACT(HOUR FROM m.consumed_at) BETWEEN 5 AND 10 THEN 'Petit-déjeuner'
                    WHEN EXTRACT(HOUR FROM m.consumed_at) BETWEEN 11 AND 14 THEN 'Déjeuner'
                    WHEN EXTRACT(HOUR FROM m.consumed_at) BETWEEN 18 AND 22 THEN 'Dîner'
                    ELSE 'Collation'
                END AS name,
                ROUND(SUM(COALESCE(m.calories_consumed, 0))::numeric, 1) AS value
            FROM meal m
            WHERE m.consumed_at IS NOT NULL
              ${mealFilterCurrent}
            GROUP BY name
            ORDER BY value DESC;
        `, params),
    ]);

    const current = currentAggResult.rows[0] ?? {};
    const previous = previousAggResult.rows[0] ?? {};

    const currentAvgDailyCalories = toNumber(current.avg_daily_calories);
    const currentAvgCaloriesPerMeal = toNumber(current.avg_calories_per_meal);
    const currentProteinG = toNumber(current.protein_g);
    const currentMealsCount = toNumber(current.meals_count);
    const currentCarbsG = toNumber(current.carbs_g);
    const currentFatG = toNumber(current.fat_g);

    const previousAvgDailyCalories = hasRange ? toNumber(previous.avg_daily_calories) : null;
    const previousAvgCaloriesPerMeal = hasRange ? toNumber(previous.avg_calories_per_meal) : null;
    const previousProteinG = hasRange ? toNumber(previous.protein_g) : null;
    const previousMealsCount = hasRange ? toNumber(previous.meals_count) : null;

    const timeSeries = timeSeriesResult.rows.map((row) => ({
        date: String(row.date),
        value: toNumber(row.value),
    }));

    const kpis = [
        {
            id: 'avg-calories-day',
            label: 'Calories moy / jour',
            description: 'Moyenne des calories consommées par jour sur la fenêtre sélectionnée.',
            value: round1(currentAvgDailyCalories),
            unit: 'kcal',
            comparedValue: hasRange ? round1(previousAvgDailyCalories ?? 0) : null,
            comparedUnit: hasRange ? 'kcal' : undefined,
            trend: trendForVolume(normalizedRange, currentAvgDailyCalories, previousAvgDailyCalories),
            trendUnit: '%',
            status: 'success',
        },
        {
            id: 'avg-calories-meal',
            label: 'Calories moy / repas',
            description: 'Charge calorique moyenne par repas enregistré.',
            value: round1(currentAvgCaloriesPerMeal),
            unit: 'kcal',
            comparedValue: hasRange ? round1(previousAvgCaloriesPerMeal ?? 0) : null,
            comparedUnit: hasRange ? 'kcal' : undefined,
            trend: trendForVolume(normalizedRange, currentAvgCaloriesPerMeal, previousAvgCaloriesPerMeal),
            trendUnit: '%',
            status: 'success',
        },
        {
            id: 'protein-total',
            label: 'Protéines totales',
            description: 'Volume total de protéines estimé à partir des ingrédients des repas.',
            value: round1(currentProteinG),
            unit: 'g',
            comparedValue: hasRange ? round1(previousProteinG ?? 0) : null,
            comparedUnit: hasRange ? 'g' : undefined,
            trend: trendForVolume(normalizedRange, currentProteinG, previousProteinG),
            trendUnit: '%',
            status: 'success',
        },
        {
            id: 'meals-count',
            label: 'Repas enregistrés',
            description: 'Nombre de repas saisis sur la période analysée.',
            value: currentMealsCount,
            comparedValue: hasRange ? previousMealsCount : null,
            trend: trendForVolume(normalizedRange, currentMealsCount, previousMealsCount),
            trendUnit: '%',
            status: 'success',
        },
    ];

    const breakdown = [
        { name: 'Protéines', value: round1(currentProteinG), color: '#16A34A' },
        { name: 'Glucides', value: round1(currentCarbsG), color: '#F59E0B' },
        { name: 'Lipides', value: round1(currentFatG), color: '#2563EB' },
    ];

    const distribution = distributionResult.rows.map((row, index) => ({
        name: String(row.name),
        value: toNumber(row.value),
        color: PALETTE[index % PALETTE.length],
    }));

    return {
        kpis,
        timeSeries,
        breakdown,
        distribution,
    };
};

export const getBiometricAnalytics = async (range = '30d') => {
    const normalizedRange = normalizeRange(range, '30d');
    const hasRange = hasBoundedRange(normalizedRange);
    const interval = RANGE_INTERVALS[normalizedRange];
    const params = hasRange ? [interval] : [];

    const metricFilterCurrent = currentWindowSql('um.recorded_date', normalizedRange);
    const metricFilterPrevious = previousWindowSql('um.recorded_date', normalizedRange);

    const biometricAggregateQuery = (dateFilterSql) => `
        SELECT
            COUNT(*)::numeric AS entries_count,
            ROUND(AVG(um.weight_kg)::numeric, 2) AS avg_weight,
            ROUND(AVG(um.heart_rate_avg)::numeric, 1) AS avg_heart_rate,
            ROUND(AVG(um.sleep_hours)::numeric, 1) AS avg_sleep_hours,
            ROUND(AVG(um.body_fat_pourcentage)::numeric, 1) AS avg_body_fat
        FROM user_metrics um
        WHERE um.recorded_date IS NOT NULL
          ${dateFilterSql};
    `;

    const [timeSeriesResult, currentAggResult, previousAggResult, heartRateZonesResult, sleepZonesResult] = await Promise.all([
        db.query(`
            SELECT
                to_char(date_trunc('day', um.recorded_date), 'YYYY-MM-DD') AS date,
                ROUND(AVG(COALESCE(um.weight_kg, 0))::numeric, 2) AS value
            FROM user_metrics um
            WHERE um.recorded_date IS NOT NULL
              AND um.weight_kg IS NOT NULL
              ${metricFilterCurrent}
            GROUP BY date_trunc('day', um.recorded_date)
            ORDER BY date;
        `, params),
        db.query(biometricAggregateQuery(metricFilterCurrent), params),
        hasRange
            ? db.query(biometricAggregateQuery(metricFilterPrevious), params)
            : Promise.resolve({ rows: [] }),
        db.query(`
            SELECT name, value
            FROM (
                SELECT
                    CASE
                        WHEN um.heart_rate_avg < 60 THEN '<60 bpm'
                        WHEN um.heart_rate_avg < 70 THEN '60-69 bpm'
                        WHEN um.heart_rate_avg < 80 THEN '70-79 bpm'
                        ELSE '>=80 bpm'
                    END AS name,
                    COUNT(*)::numeric AS value,
                    CASE
                        WHEN um.heart_rate_avg < 60 THEN 1
                        WHEN um.heart_rate_avg < 70 THEN 2
                        WHEN um.heart_rate_avg < 80 THEN 3
                        ELSE 4
                    END AS sort_order
                FROM user_metrics um
                WHERE um.recorded_date IS NOT NULL
                  AND um.heart_rate_avg IS NOT NULL
                  ${metricFilterCurrent}
                GROUP BY name, sort_order
            ) zones
            ORDER BY zones.sort_order;
        `, params),
        db.query(`
            SELECT name, value
            FROM (
                SELECT
                    CASE
                        WHEN um.sleep_hours < 6 THEN '<6 h'
                        WHEN um.sleep_hours < 7 THEN '6-7 h'
                        WHEN um.sleep_hours < 8 THEN '7-8 h'
                        ELSE '>=8 h'
                    END AS name,
                    COUNT(*)::numeric AS value,
                    CASE
                        WHEN um.sleep_hours < 6 THEN 1
                        WHEN um.sleep_hours < 7 THEN 2
                        WHEN um.sleep_hours < 8 THEN 3
                        ELSE 4
                    END AS sort_order
                FROM user_metrics um
                WHERE um.recorded_date IS NOT NULL
                  AND um.sleep_hours IS NOT NULL
                  ${metricFilterCurrent}
                GROUP BY name, sort_order
            ) zones
            ORDER BY zones.sort_order;
        `, params),
    ]);

    const current = currentAggResult.rows[0] ?? {};
    const previous = previousAggResult.rows[0] ?? {};

    const currentAvgWeight = toNumber(current.avg_weight);
    const currentAvgHeartRate = toNumber(current.avg_heart_rate);
    const currentAvgSleepHours = toNumber(current.avg_sleep_hours);
    const currentAvgBodyFat = toNumber(current.avg_body_fat);

    const previousAvgWeight = hasRange ? toNumber(previous.avg_weight) : null;
    const previousAvgHeartRate = hasRange ? toNumber(previous.avg_heart_rate) : null;
    const previousAvgSleepHours = hasRange ? toNumber(previous.avg_sleep_hours) : null;
    const previousAvgBodyFat = hasRange ? toNumber(previous.avg_body_fat) : null;

    const timeSeries = timeSeriesResult.rows.map((row) => ({
        date: String(row.date),
        value: toNumber(row.value),
    }));

    const kpis = [
        {
            id: 'avg-weight',
            label: 'Poids moyen',
            description: 'Poids moyen observé sur les relevés biométriques de la période.',
            value: round1(currentAvgWeight),
            unit: 'kg',
            comparedValue: hasRange ? round1(previousAvgWeight ?? 0) : null,
            comparedUnit: hasRange ? 'kg' : undefined,
            trend: trendForVolume(normalizedRange, currentAvgWeight, previousAvgWeight),
            trendUnit: '%',
            status: 'success',
        },
        {
            id: 'avg-heart-rate',
            label: 'Fréquence cardiaque moy',
            description: 'Fréquence cardiaque moyenne au repos.',
            value: round1(currentAvgHeartRate),
            unit: 'bpm',
            comparedValue: hasRange ? round1(previousAvgHeartRate ?? 0) : null,
            comparedUnit: hasRange ? 'bpm' : undefined,
            trend: trendForVolume(normalizedRange, currentAvgHeartRate, previousAvgHeartRate),
            trendUnit: '%',
            trendPositiveIsGood: false,
            status: 'success',
        },
        {
            id: 'avg-sleep-hours',
            label: 'Sommeil moyen',
            description: 'Nombre moyen d\'heures de sommeil par relevé.',
            value: round1(currentAvgSleepHours),
            unit: 'h',
            comparedValue: hasRange ? round1(previousAvgSleepHours ?? 0) : null,
            comparedUnit: hasRange ? 'h' : undefined,
            trend: trendForVolume(normalizedRange, currentAvgSleepHours, previousAvgSleepHours),
            trendUnit: '%',
            status: 'success',
        },
        {
            id: 'avg-body-fat',
            label: 'Masse grasse moyenne',
            description: 'Pourcentage moyen de masse grasse relevé.',
            value: round1(currentAvgBodyFat),
            unit: '%',
            comparedValue: hasRange ? round1(previousAvgBodyFat ?? 0) : null,
            comparedUnit: hasRange ? '%' : undefined,
            trend: trendForVolume(normalizedRange, currentAvgBodyFat, previousAvgBodyFat),
            trendUnit: '%',
            trendPositiveIsGood: false,
            status: 'success',
        },
    ];

    const breakdown = heartRateZonesResult.rows.map((row, index) => ({
        name: String(row.name),
        value: toNumber(row.value),
        color: PALETTE[index % PALETTE.length],
    }));

    const distribution = sleepZonesResult.rows.map((row, index) => ({
        name: String(row.name),
        value: toNumber(row.value),
        color: PALETTE[index % PALETTE.length],
    }));

    return {
        kpis,
        timeSeries,
        breakdown,
        distribution,
    };
};

export const getDataQualityScore = async (range = '30d') => {
    const normalizedRange = normalizeRange(range, '30d');
    const hasRange = hasBoundedRange(normalizedRange);
    const interval = RANGE_INTERVALS[normalizedRange];
    const rangeDays = RANGE_DAYS[normalizedRange] ?? 30;
    const params = hasRange ? [interval] : [];
    const qualityFilterCurrent = currentWindowSql('dqc.checked_at', normalizedRange);

    const overallQuery = `
        SELECT
            CASE
                WHEN COALESCE(SUM(dqc.records_checked), 0) <= 0 THEN 0
                ELSE ROUND(
                    GREATEST(
                        0,
                        LEAST(
                            100,
                            (1 - (COALESCE(SUM(dqc.records_failed), 0)::numeric / NULLIF(COALESCE(SUM(dqc.records_checked), 0)::numeric, 0))) * 100
                        )
                    ),
                    1
                )
            END AS score
        FROM data_quality_check_ dqc
        WHERE dqc.checked_at IS NOT NULL
          ${qualityFilterCurrent};
    `;

    const dimensionsQuery = `
        SELECT
            COALESCE(LOWER(dqc.check_type), 'unknown') AS name,
            CASE
                WHEN COALESCE(SUM(dqc.records_checked), 0) <= 0 THEN 0
                ELSE ROUND(
                    GREATEST(
                        0,
                        LEAST(
                            100,
                            (1 - (COALESCE(SUM(dqc.records_failed), 0)::numeric / NULLIF(COALESCE(SUM(dqc.records_checked), 0)::numeric, 0))) * 100
                        )
                    ),
                    1
                )
            END AS score
        FROM data_quality_check_ dqc
        WHERE dqc.checked_at IS NOT NULL
          ${qualityFilterCurrent}
        GROUP BY LOWER(dqc.check_type)
        ORDER BY score DESC, name ASC;
    `;

    const historyQuery = hasRange
        ? `
            WITH days AS (
                SELECT generate_series(current_date - ($2::int - 1), current_date, interval '1 day')::date AS day
            ),
            daily AS (
                SELECT
                    date(dqc.checked_at) AS day,
                    COALESCE(SUM(dqc.records_checked), 0)::numeric AS checked,
                    COALESCE(SUM(dqc.records_failed), 0)::numeric AS failed
                FROM data_quality_check_ dqc
                WHERE dqc.checked_at IS NOT NULL
                  AND dqc.checked_at >= now() - $1::interval
                  AND dqc.checked_at <= now()
                GROUP BY date(dqc.checked_at)
            )
            SELECT
                to_char(days.day, 'YYYY-MM-DD') AS date,
                CASE
                    WHEN COALESCE(daily.checked, 0) <= 0 THEN 0
                    ELSE ROUND(
                        GREATEST(
                            0,
                            LEAST(100, (1 - (daily.failed / NULLIF(daily.checked, 0))) * 100)
                        ),
                        1
                    )
                END AS score
            FROM days
            LEFT JOIN daily ON daily.day = days.day
            ORDER BY days.day;
        `
        : `
            WITH bounds AS (
                SELECT
                    COALESCE(MIN(date(dqc.checked_at)), current_date) AS min_day,
                    COALESCE(MAX(date(dqc.checked_at)), current_date) AS max_day
                FROM data_quality_check_ dqc
                WHERE dqc.checked_at IS NOT NULL
            ),
            days AS (
                SELECT generate_series(min_day, max_day, interval '1 day')::date AS day
                FROM bounds
            ),
            daily AS (
                SELECT
                    date(dqc.checked_at) AS day,
                    COALESCE(SUM(dqc.records_checked), 0)::numeric AS checked,
                    COALESCE(SUM(dqc.records_failed), 0)::numeric AS failed
                FROM data_quality_check_ dqc
                WHERE dqc.checked_at IS NOT NULL
                GROUP BY date(dqc.checked_at)
            )
            SELECT
                to_char(days.day, 'YYYY-MM-DD') AS date,
                CASE
                    WHEN COALESCE(daily.checked, 0) <= 0 THEN 0
                    ELSE ROUND(
                        GREATEST(
                            0,
                            LEAST(100, (1 - (daily.failed / NULLIF(daily.checked, 0))) * 100)
                        ),
                        1
                    )
                END AS score
            FROM days
            LEFT JOIN daily ON daily.day = days.day
            ORDER BY days.day;
        `;

    const historyParams = hasRange ? [interval, rangeDays] : [];

    const [overallResult, dimensionsResult, historyResult] = await Promise.all([
        db.query(overallQuery, params),
        db.query(dimensionsQuery, params),
        db.query(historyQuery, historyParams),
    ]);

    return {
        overall: {
            score: round1(toNumber(overallResult.rows[0]?.score, 0)),
        },
        dimensions: dimensionsResult.rows.map((row) => ({
            name: String(row.name || 'unknown'),
            score: round1(toNumber(row.score, 0)),
        })),
        history: historyResult.rows.map((row) => ({
            date: String(row.date),
            score: round1(toNumber(row.score, 0)),
        })),
    };
};

const partnersListQuery = `
    WITH org_base AS (
        SELECT o.organization_id, o.name
        FROM organization o
    ),
    org_members AS (
        SELECT
            uo.organization_id,
            COUNT(DISTINCT uo.user_id)::int AS users_count,
            COUNT(DISTINCT CASE WHEN r.role_type = 'B2B' THEN u.user_id END)::int AS b2b_users_count
        FROM user_organization uo
        JOIN user_ u ON u.user_id = uo.user_id
        JOIN role r ON r.role_id = u.role_id
        GROUP BY uo.organization_id
    ),
    org_logins AS (
        SELECT
            uo.organization_id,
            COUNT(*) FILTER (
                WHERE lh.last_login >= now() - interval '${PARTNER_ACTIVITY_INTERVAL_SQL}'
            )::int AS logins_30d,
            COUNT(DISTINCT CASE
                WHEN lh.last_login >= now() - interval '${PARTNER_ACTIVITY_INTERVAL_SQL}' THEN lh.user_id
            END)::int AS active_users_30d,
            MAX(lh.last_login) AS last_login
        FROM user_organization uo
        LEFT JOIN login_history lh ON lh.user_id = uo.user_id
        GROUP BY uo.organization_id
    ),
    org_workouts AS (
        SELECT
            uo.organization_id,
            COUNT(*) FILTER (
                WHERE ws.start_at >= now() - interval '${PARTNER_ACTIVITY_INTERVAL_SQL}'
            )::int AS workout_sessions_30d,
            MAX(ws.start_at) AS last_workout
        FROM user_organization uo
        LEFT JOIN workout_session ws ON ws.user_id = uo.user_id
        GROUP BY uo.organization_id
    )
    SELECT
        ob.organization_id,
        ob.name,
        COALESCE(om.users_count, 0)::int AS users_count,
        COALESCE(om.b2b_users_count, 0)::int AS b2b_users_count,
        COALESCE(ol.active_users_30d, 0)::int AS active_users_30d,
        COALESCE(ol.logins_30d, 0)::int AS logins_30d,
        COALESCE(ow.workout_sessions_30d, 0)::int AS workout_sessions_30d,
        (COALESCE(ol.logins_30d, 0) + COALESCE(ow.workout_sessions_30d, 0))::int AS activity_events_30d,
        NULLIF(
            GREATEST(
                COALESCE(ol.last_login, TIMESTAMP 'epoch'),
                COALESCE(ow.last_workout, TIMESTAMP 'epoch')
            ),
            TIMESTAMP 'epoch'
        ) AS last_activity
    FROM org_base ob
    LEFT JOIN org_members om ON om.organization_id = ob.organization_id
    LEFT JOIN org_logins ol ON ol.organization_id = ob.organization_id
    LEFT JOIN org_workouts ow ON ow.organization_id = ob.organization_id
    ORDER BY activity_events_30d DESC, users_count DESC, ob.name ASC;
`;

const monthlyPartnerActivityQuery = `
    WITH months AS (
        SELECT generate_series(
            date_trunc('month', now()) - interval '5 months',
            date_trunc('month', now()),
            interval '1 month'
        ) AS month_start
    ),
    login_counts AS (
        SELECT
            date_trunc('month', lh.last_login) AS month_start,
            COUNT(*)::int AS value
        FROM login_history lh
        JOIN user_organization uo ON uo.user_id = lh.user_id
        GROUP BY date_trunc('month', lh.last_login)
    ),
    workout_counts AS (
        SELECT
            date_trunc('month', ws.start_at) AS month_start,
            COUNT(*)::int AS value
        FROM workout_session ws
        JOIN user_organization uo ON uo.user_id = ws.user_id
        GROUP BY date_trunc('month', ws.start_at)
    )
    SELECT
        to_char(m.month_start, 'YYYY-MM-DD') AS date,
        (COALESCE(lc.value, 0) + COALESCE(wc.value, 0))::int AS value
    FROM months m
    LEFT JOIN login_counts lc ON lc.month_start = m.month_start
    LEFT JOIN workout_counts wc ON wc.month_start = m.month_start
    ORDER BY m.month_start;
`;

const mapPartnerRow = (row) => {
    const activityEvents30d = toNumber(row.activity_events_30d);
    const logins30d = toNumber(row.logins_30d);
    const workoutSessions30d = toNumber(row.workout_sessions_30d);

    return {
        id: String(row.organization_id),
        name: String(row.name || "Organisation inconnue"),
        status: activityEvents30d > 0 ? 'active' : 'inactive',
        usersCount: toNumber(row.users_count),
        b2bUsersCount: toNumber(row.b2b_users_count),
        activeUsers30d: toNumber(row.active_users_30d),
        logins30d,
        workoutSessions30d,
        activityEvents30d,
        lastActivity: toIsoOrNull(row.last_activity),
    };
};

export const getPartners = async () => {
    const result = await db.query(partnersListQuery);
    return result.rows.map(mapPartnerRow);
};

export const getPartnersDashboard = async () => {
    const [partners, monthlyActivityResult] = await Promise.all([
        getPartners(),
        db.query(monthlyPartnerActivityQuery),
    ]);

    const usageByPartner = partners
        .slice()
        .sort((a, b) => b.activityEvents30d - a.activityEvents30d)
        .map((partner) => ({
            name: partner.name,
            value: partner.activityEvents30d,
        }));

    const activePartners = partners.filter((partner) => partner.status === 'active').length;
    const inactivePartners = partners.length - activePartners;

    const partnerStatusBreakdown = [
        {
            name: 'Actifs sur 30 jours',
            value: activePartners,
            color: '#16A34A',
        },
        {
            name: 'Sans activité sur 30 jours',
            value: inactivePartners,
            color: '#6B7280',
        },
    ];

    const monthlyActivityEvents = monthlyActivityResult.rows.map((row) => ({
        date: String(row.date),
        value: toNumber(row.value),
    }));

    return {
        partners,
        usageByPartner,
        partnerStatusBreakdown,
        monthlyActivityEvents,
    };
};

export const RANGE_INTERVALS = {
    '7d': '7 days',
    '30d': '30 days',
    '90d': '90 days',
    all: null,
};

export const RANGE_DAYS = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    all: null,
};

export const normalizeRange = (range, fallback = '30d') => {
    if (typeof range !== 'string') return fallback;
    const normalized = range.trim().toLowerCase();
    return Object.prototype.hasOwnProperty.call(RANGE_INTERVALS, normalized) ? normalized : fallback;
};

export const hasBoundedRange = (range) => RANGE_INTERVALS[range] !== null;

export const round1 = (value) => Math.round(Number(value || 0) * 10) / 10;

export const safePercent = (num, den) => {
    const numerator = Number(num || 0);
    const denominator = Number(den || 0);
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
        return 0;
    }
    return (numerator / denominator) * 100;
};

export const percentDelta = (current, previous) => {
    if (previous === null || previous === undefined) return null;
    const currentNum = Number(current);
    const previousNum = Number(previous);
    if (!Number.isFinite(currentNum) || !Number.isFinite(previousNum) || previousNum === 0) return null;
    return round1(((currentNum - previousNum) / previousNum) * 100);
};

export const pointDelta = (current, previous) => {
    if (previous === null || previous === undefined) return null;
    const currentNum = Number(current);
    const previousNum = Number(previous);
    if (!Number.isFinite(currentNum) || !Number.isFinite(previousNum)) return null;
    return round1(currentNum - previousNum);
};

export const trendForVolume = (range, current, previous) => (
    hasBoundedRange(range) ? percentDelta(current, previous) : null
);

export const trendForRate = (range, current, previous) => (
    hasBoundedRange(range) ? pointDelta(current, previous) : null
);

export const currentWindowSql = (column, range) => (
    hasBoundedRange(range)
        ? `AND ${column} >= now() - $1::interval AND ${column} <= now()`
        : ''
);

export const previousWindowSql = (column, range) => (
    hasBoundedRange(range)
        ? `AND ${column} >= now() - ($1::interval * 2) AND ${column} < now() - $1::interval`
        : ''
);

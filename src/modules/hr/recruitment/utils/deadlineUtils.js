/**
 * deadlineUtils.js
 * Pure utility functions for job application deadline logic.
 * No side-effects — safe to call anywhere.
 */

/**
 * Returns true when the application window is closed.
 * Prefer the server-provided `is_open` field; fall back to client-side date
 * comparison when the field is absent (defensive).
 *
 * @param {Object} job  - Job object from the API
 * @returns {boolean}
 */
export function isDeadlineExpired(job) {
    // Honour explicit server flag when present
    if (typeof job.is_open === 'boolean') return !job.is_open;

    // No closing date → always open
    if (!job.closing_date) return false;

    const closing = new Date(job.closing_date);
    // Treat closing_date as end-of-day in local time
    closing.setHours(23, 59, 59, 999);
    return Date.now() > closing.getTime();
}

/**
 * Formats a closing date as a human-readable string.
 * e.g. "Friday, 6 February 2026"
 *
 * @param {string|Date} dateStr
 * @returns {string}
 */
export function formatClosingDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-KE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

/**
 * Returns a { days, hours, minutes, seconds, totalMs } object describing
 * the time remaining until the closing date.
 * Returns null when no closing date exists or deadline is already passed.
 *
 * @param {string|Date} closingDate
 * @returns {{ days: number, hours: number, minutes: number, seconds: number, totalMs: number } | null}
 */
export function getTimeRemaining(closingDate) {
    if (!closingDate) return null;

    const end = new Date(closingDate);
    end.setHours(23, 59, 59, 999);
    const totalMs = end.getTime() - Date.now();

    if (totalMs <= 0) return null;

    const seconds = Math.floor((totalMs / 1000) % 60);
    const minutes = Math.floor((totalMs / 1000 / 60) % 60);
    const hours   = Math.floor((totalMs / 1000 / 60 / 60) % 24);
    const days    = Math.floor(totalMs / 1000 / 60 / 60 / 24);

    return { days, hours, minutes, seconds, totalMs };
}

/**
 * Returns a human-readable countdown string + urgency level.
 * e.g. "Closes in 5 days 4 hours"
 *
 * @param {string|Date} closingDate
 * @returns {{ label: string, urgency: 'normal'|'warning'|'critical' } | null}
 */
export function getCountdownInfo(closingDate) {
    const t = getTimeRemaining(closingDate);
    if (!t) return null;

    const TWELVE_HOURS = 12 * 60 * 60 * 1000;
    const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;

    let label;
    if (t.days > 1) {
        label = `Closes in ${t.days} day${t.days !== 1 ? 's' : ''} ${t.hours} hour${t.hours !== 1 ? 's' : ''}`;
    } else if (t.days === 1) {
        label = `Closes in 1 day ${t.hours} hour${t.hours !== 1 ? 's' : ''}`;
    } else if (t.hours >= 1) {
        label = `Closes in ${t.hours} hour${t.hours !== 1 ? 's' : ''} ${t.minutes} min`;
    } else {
        label = `Closes in ${t.minutes} min ${t.seconds}s`;
    }

    const urgency =
        t.totalMs <= TWELVE_HOURS   ? 'critical' :
        t.totalMs <= FORTY_EIGHT_HOURS ? 'warning'  : 'normal';

    return { label, urgency };
}

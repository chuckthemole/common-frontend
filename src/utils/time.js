/**
 * -----------------------------------------------------------------------------
 * Time Utilities
 * -----------------------------------------------------------------------------
 *
 * Centralized helpers for timestamp formatting and relative time calculations.
 *
 * Features:
 *  - ISO formatting
 *  - Locale (human-readable) formatting
 *  - Relative time formatting ("2m ago")
 *  - Safe timestamp parsing
 * -----------------------------------------------------------------------------
 */

export const TimestampFormat = Object.freeze({
    ISO: "iso",
    HUMAN: "human",
    RELATIVE: "relative",
});

/**
 * Safely converts a timestamp into a Date object.
 */
export function toDate(timestamp) {
    if (!timestamp) return null;

    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? null : date;
}

/**
 * Formats timestamp into ISO string.
 */
export function formatISO(timestamp) {
    const date = toDate(timestamp);
    return date ? date.toISOString() : "";
}

/**
 * Formats timestamp into human-readable local string.
 */
export function formatHuman(timestamp) {
    const date = toDate(timestamp);
    return date ? date.toLocaleString() : "";
}

/**
 * Formats timestamp into relative time ("5m ago", "2h ago", etc.)
 */
export function formatRelative(timestamp, now = Date.now()) {
    const date = toDate(timestamp);
    if (!date) return "";

    const diff = now - date.getTime();
    const seconds = Math.floor(diff / 1000);

    if (seconds < 0) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;

    return `${Math.floor(seconds / 86400)}d ago`;
}

/**
 * Main formatter dispatcher.
 */
export function formatTimestamp(timestamp, format = TimestampFormat.HUMAN) {
    switch (format) {
        case TimestampFormat.ISO:
            return formatISO(timestamp);

        case TimestampFormat.RELATIVE:
            return formatRelative(timestamp);

        case TimestampFormat.HUMAN:
        default:
            return formatHuman(timestamp);
    }
}

/**
 * Cycles timestamp format in a predictable UI loop.
 */
export function cycleTimestampFormat(current) {
    switch (current) {
        case TimestampFormat.HUMAN:
            return TimestampFormat.RELATIVE;
        case TimestampFormat.RELATIVE:
            return TimestampFormat.ISO;
        default:
            return TimestampFormat.HUMAN;
    }
}
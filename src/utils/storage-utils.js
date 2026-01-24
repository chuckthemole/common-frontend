/* ============================================================
   storageUtils.js
   General utilities for inspecting localStorage values
   ============================================================ */

/**
 * Safely attempt to parse JSON from a string (e.g. localStorage value)
 *
 * @param {string|null} value
 * @returns {{ parsed: any, isJson: boolean }}
 */
export function tryParseJSON(value) {
    if (typeof value !== "string") {
        return { parsed: value, isJson: false };
    }

    try {
        return {
            parsed: JSON.parse(value),
            isJson: true,
        };
    } catch {
        return {
            parsed: value,
            isJson: false,
        };
    }
}

/**
 * Convert a value into a displayable string
 *
 * @param {any} value
 * @param {boolean} pretty - pretty-print JSON with indentation
 * @returns {string}
 */
export function stringifyValue(value, pretty = false) {
    if (typeof value === "string") return value;

    try {
        return JSON.stringify(value, null, pretty ? 2 : 0);
    } catch {
        return String(value);
    }
}

/**
 * Determines whether a value should be collapsible in the UI
 *
 * @param {any} value
 * @param {number} threshold
 * @returns {boolean}
 */
export function isLongValue(value, threshold = 120) {
    const text = stringifyValue(value, true);
    return text.length > threshold || text.includes("\n");
}

export function getLocalStorageSnapshot() {
    return Object.keys(localStorage).map((key) => {
        const rawValue = localStorage.getItem(key);
        const { parsed, isJson } = tryParseJSON(rawValue);

        return {
            key,
            rawValue,
            value: parsed,
            isJson,
        };
    });
}

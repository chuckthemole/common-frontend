import { logger } from './logger';

// -----------------------------------------------------------------------------
// This module defines pluggable persistence strategies for storing key-value
// data (e.g., site colors).
//
// Available strategies:
//   - LocalPersistence: Browser localStorage (per user, per device)
//   - MemoryPersistence: In-memory (lost on refresh, good for testing)
//   - ApiPersistence: Remote backend persistence (shared across users/devices)
//
// In production, you should replace the `fetch` calls in ApiPersistence with
// your own Axios instance (configured with interceptors, baseURL, auth tokens, etc).
// -----------------------------------------------------------------------------

/**
 * LocalPersistence
 * ---------------------------------------------------------------------------
 * Persists data to the browser's localStorage.
 * - Good for per-user customization (dark mode, theme colors).
 * - Data sticks across refreshes but is local to each device/browser.
 */
export const LocalPersistence = {
    getItem: (key) => {
        try {
            return localStorage.getItem(key);
        } catch (err) {
            logger.error(`[LocalPersistence] Failed to get "${key}":`, err);
            return null;
        }
    },
    setItem: (key, value) => {
        try {
            localStorage.setItem(key, value);
        } catch (err) {
            logger.error(`[LocalPersistence] Failed to set "${key}":`, err);
        }
    }
};

/**
 * MemoryPersistence
 * ---------------------------------------------------------------------------
 * Persists data in a plain in-memory object.
 * - Useful for unit tests, demos, or ephemeral state that should not persist.
 * - Data is lost on page refresh.
 */
export const MemoryPersistence = (() => {
    const store = {};
    return {
        getItem: (key) => store[key] ?? null,
        setItem: (key, value) => {
            store[key] = value;
        }
    };
})();

/**
 * ApiPersistence
 * ---------------------------------------------------------------------------
 * Persists data by calling a backend API endpoint.
 * - Good for site-wide themes or syncing preferences across devices.
 * - Replace the `fetch` implementation with your own Axios client.
 *
 * Usage:
 *   const apiPersistence = ApiPersistence("/api/colors");
 *   await apiPersistence.setItem("navbar-background", "#123456");
 */
export const ApiPersistence = (baseEndpoint = "/api/colors") => ({
    getItem: async (key) => {
        try {
            const response = await fetch(`${baseEndpoint}/${encodeURIComponent(key)}`);
            if (!response.ok) {
                logger.warn(`[ApiPersistence] Failed to get "${key}":`, response.status);
                return null;
            }
            const data = await response.json();
            return data.value ?? null;
        } catch (err) {
            logger.error(`[ApiPersistence] Error fetching "${key}":`, err);
            return null;
        }
    },

    setItem: async (key, value) => {
        try {
            const response = await fetch(`${baseEndpoint}/${encodeURIComponent(key)}`, {
                method: "POST", // or PUT, depending on your API
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ value })
            });
            if (!response.ok) {
                logger.warn(`[ApiPersistence] Failed to set "${key}":`, response.status);
            }
        } catch (err) {
            logger.error(`[ApiPersistence] Error setting "${key}":`, err);
        }
    }
});

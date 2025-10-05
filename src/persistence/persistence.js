import logger from '../logger';
import { getApi, getNamedApi } from '../api';

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
 * A flexible persistence layer that talks to backend API endpoints.
 * - Uses Axios-based API clients.
 * - Defaults to MAIN API unless another is provided.
 * - Accepts either a base string or an endpoint object for custom setups.
 *
 * Example (simple):
 *   const themeStore = ApiPersistence("/api/colors");
 *
 * Example (custom endpoints):
 *   const userPrefs = ApiPersistence({
 *       get: "/api/preferences/:key",
 *       getAll: "/api/preferences",
 *       set: "/api/preferences",
 *       update: "/api/preferences/:key",
 *       delete: "/api/preferences/:key"
 *   }, "MAIN");
 *
 * Example (custom query):
 *   const notionStore = ApiPersistence("/notion-api/integrations/notion");
 *   const res = await notionStore.customGet(
 *       "/projectManagementIntegration/database",
 *       { params: { name: "tasks" } }
 *   );
 */
export const ApiPersistence = (endpoints = "/api/colors", apiName = null) => {
    const api = apiName ? getNamedApi(apiName) : getApi();

    // Normalize endpoints into an object
    const ep = typeof endpoints === "string"
        ? {
            get: `${endpoints}/:key`,
            getAll: endpoints,
            set: `${endpoints}/:key`,
            update: `${endpoints}/:key`,
            delete: `${endpoints}/:key`,
        }
        : endpoints;

    // Helper: substitute :key
    const resolve = (template, key) =>
        key ? template.replace(":key", encodeURIComponent(key)) : template;

    return {
        /** Fetch single item (optionally with query params or config) */
        getItem: async (key, config = {}) => {
            try {
                const res = await api.get(resolve(ep.get, key), config);
                return res.data?.value ?? res.data ?? null;
            } catch (err) {
                logger.error(`[ApiPersistence] getItem "${key}" failed:`, err.message);
                return null;
            }
        },

        /** Fetch all items */
        getAll: async (config = {}) => {
            try {
                const res = await api.get(resolve(ep.getAll), config);
                return res.data ?? [];
            } catch (err) {
                logger.error("[ApiPersistence] getAll failed:", err?.message ?? err);
                return null;
            }
        },

        /** Create or replace (optionally with params or config) */
        setItem: async (key, value, config = {}) => {
            try {
                await api.post(resolve(ep.set, key), { value }, config);
            } catch (err) {
                logger.error(`[ApiPersistence] setItem "${key}" failed:`, err.message);
            }
        },

        /** Partially update (optionally with params or config) */
        updateItem: async (key, value, config = {}) => {
            try {
                await api.patch(resolve(ep.update, key), { value }, config);
            } catch (err) {
                logger.error(`[ApiPersistence] updateItem "${key}" failed:`, err.message);
            }
        },

        /** Delete by key (optionally with params or config) */
        removeItem: async (key, config = {}) => {
            try {
                await api.delete(resolve(ep.delete, key), config);
            } catch (err) {
                logger.error(`[ApiPersistence] removeItem "${key}" failed:`, err.message);
            }
        },

        // ---------------------------------------------------------------------
        // CUSTOM REQUESTS (power mode)
        // ---------------------------------------------------------------------

        /** Perform a custom GET with any params */
        customGet: async (url, config = {}) => {
            try {
                const res = await api.get(url, config);
                return res.data;
            } catch (err) {
                logger.error(`[ApiPersistence] customGet "${url}" failed:`, err.message);
                return null;
            }
        },

        /** Perform a custom POST */
        customPost: async (url, body = {}, config = {}) => {
            try {
                const res = await api.post(url, body, config);
                return res.data;
            } catch (err) {
                logger.error(`[ApiPersistence] customPost "${url}" failed:`, err.message);
                return null;
            }
        },

        /** Perform a custom PATCH */
        customPatch: async (url, body = {}, config = {}) => {
            try {
                const res = await api.patch(url, body, config);
                return res.data;
            } catch (err) {
                logger.error(`[ApiPersistence] customPatch "${url}" failed:`, err.message);
                return null;
            }
        },

        /** Perform a custom DELETE */
        customDelete: async (url, config = {}) => {
            try {
                const res = await api.delete(url, config);
                return res.data;
            } catch (err) {
                logger.error(`[ApiPersistence] customDelete "${url}" failed:`, err.message);
                return null;
            }
        },
    };
};

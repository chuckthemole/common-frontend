import axios from 'axios';

// ----------------------------
// API Registry
// ----------------------------
const apis = new Map();
const MAIN_API_KEY = 'MAIN';

/**
 * Set the MAIN api (backward compatible).
 */
export function setApi(instance) {
    setNamedApi(MAIN_API_KEY, instance);
}

/**
 * Get the MAIN api (backward compatible).
 */
export function getApi() {
    return getNamedApi(MAIN_API_KEY);
}

/**
 * Set a named API instance.
 * @param {string} name
 * @param {import('axios').AxiosInstance} instance
 */
export function setNamedApi(name, instance) {
    if (!name) throw new Error('API name must be provided.');
    apis.set(name, instance);
}

/**
 * Get a named API instance.
 * @param {string} name
 * @returns {import('axios').AxiosInstance}
 */
export function getNamedApi(name) {
    if (!apis.has(name)) {
        throw new Error(`API instance "${name}" not set. Call setNamedApi() first.`);
    }
    return apis.get(name);
}

/**
 * Create a new API client.
 * Consumers can choose to set it as MAIN or under a custom name.
 * TODO: maybe let user decide params to set.
 */
export function createApiClient(baseURL, extraConfig = {}) {
    return axios.create({
        baseURL,
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
        ...extraConfig
    });
}

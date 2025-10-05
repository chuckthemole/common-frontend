import { ApiPersistence } from "./persistence";

const persistences = new Map();

/**
 * Register a persistence instance under a name.
 * @param {string} name
 * @param {ReturnType<ApiPersistence>} instance
 */
export function setPersistence(name, instance) {
    if (!name) throw new Error("Persistence name must be provided.");
    persistences.set(name, instance);
}

/**
 * Retrieve a persistence instance by name.
 * @param {string} name
 * @returns {ReturnType<ApiPersistence>}
 */
export function getPersistence(name) {
    if (!persistences.has(name)) {
        throw new Error(`Persistence "${name}" not found. Call setPersistence() first.`);
    }
    return persistences.get(name);
}

/**
 * Remove a persistence instance.
 * @param {string} name
 */
export function removePersistence(name) {
    persistences.delete(name);
}

/**
 * Create and register a new persistence instance in one step.
 * @param {string} name
 * @param {string|object} endpoints - base path or endpoint object
 * @param {string|null} apiName - optional API name
 * @returns {ReturnType<ApiPersistence>}
 */
export function createPersistence(name, endpoints, apiName = null) {
    const instance = ApiPersistence(endpoints, apiName);
    setPersistence(name, instance);
    return instance;
}

/**
 * Get all registered persistences
 * @returns {Map<string, ReturnType<ApiPersistence>>}
 */
export function listPersistences() {
    return new Map(persistences);
}

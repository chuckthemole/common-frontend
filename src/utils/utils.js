/**
 * Normalize a URL/path for internal app navigation.
 *
 * - Ensures it starts with a single leading slash
 * - Removes duplicate slashes
 * - Preserves query parameters and hash fragments
 *
 * @param {string} path - The input URL/path (e.g., 'mylink', '/mylink/', '///other/path')
 * @returns {string} Normalized URL starting with '/'
 */
export function normalizeUrl(path) {
    if (!path) return '/';

    // Split into path and possible hash/query
    const [pathname, hashOrQuery] = path.split(/(?=[#?])/);

    // Remove duplicate slashes and ensure leading slash
    const normalizedPath = '/' + pathname.replace(/^\/+|\/+$/g, '');

    return normalizedPath + (hashOrQuery || '');
}

/**
 * -----------------------------------------------------------------------------
 * normalizeRoutePath
 * -----------------------------------------------------------------------------
 *
 * Normalizes route paths for consistent matching.
 *
 * -----------------------------------------------------------------------------
 */
export function normalizeRoutePath(path = "") {

    return (
        "/" +
        path
            .replace(/^\/+/, "")
            .replace(/\/+$/, "")
    );
}

export const appendScript = (scriptToAppend) => {
    const script = document.createElement("script");
    script.src = scriptToAppend;
    script.async = true;
    document.body.appendChild(script);
}

// Colors
/**
 * isColor
 *
 * Detects if a string is a valid hex color.
 * Supports #RGB, #RRGGBB formats.
 *
 * @param {string} value
 * @returns {boolean}
 */
export function isColor(value) {
    return typeof value === "string" && /^#([0-9A-Fa-f]{3}){1,2}$/.test(value);
}

export const toKebabCase = (str) =>
    str
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2") // handle camelCase
        .replace(/[_\s]+/g, "-")               // handle snake_case / spaces
        .toLowerCase();


/**
 * -----------------------------------------------------------------------------
 * getNestedValue
 * -----------------------------------------------------------------------------
 *
 * Safely resolves a deeply nested value from an object using a path array.
 *
 * Supports:
 * - deeply nested objects
 * - optional chaining safety
 * - schema-driven path resolution
 *
 * Useful for:
 * - form builders
 * - schema-driven editors
 * - validation systems
 * - recursive object utilities
 *
 * -----------------------------------------------------------------------------
 *
 * Example:
 *
 * const user = {
 *   profile: {
 *     bio: "Hello world"
 *   }
 * };
 *
 * getNestedValue(
 *   user,
 *   ["profile", "bio"]
 * );
 *
 * Returns:
 * "Hello world"
 *
 * -----------------------------------------------------------------------------
 *
 * Missing paths safely return undefined.
 *
 * Example:
 *
 * getNestedValue(
 *   user,
 *   ["profile", "missing"]
 * );
 *
 * Returns:
 * undefined
 *
 * -----------------------------------------------------------------------------
 */

export const getNestedValue = (
    obj,
    path = []
) => {

    return path.reduce(
        (current, key) => current?.[key],
        obj
    );
};

/**
 * -----------------------------------------------------------------------------
 * setNestedValue
 * -----------------------------------------------------------------------------
 *
 * Safely assigns a deeply nested value into an object using a path array.
 *
 * Missing intermediate objects are automatically created.
 *
 * MUTATES the provided object.
 *
 * -----------------------------------------------------------------------------
 *
 * Example:
 *
 * const obj = {};
 *
 * setNestedValue(
 *   obj,
 *   ["profile", "bio"],
 *   "Hello world"
 * );
 *
 * Result:
 *
 * {
 *   profile: {
 *     bio: "Hello world"
 *   }
 * }
 *
 * -----------------------------------------------------------------------------
 *
 * Useful for:
 * - schema-driven forms
 * - recursive editors
 * - normalization pipelines
 * - nested state utilities
 *
 * -----------------------------------------------------------------------------
 */

export const setNestedValue = (
    obj,
    path = [],
    value
) => {

    let current = obj;

    for (let i = 0; i < path.length - 1; i++) {

        const key = path[i];

        /**
         * Create missing nested containers
         */
        if (
            typeof current[key] !== "object" ||
            current[key] === null
        ) {
            current[key] = {};
        }

        current = current[key];
    }

    current[path[path.length - 1]] = value;
};

/**
 * -----------------------------------------------------------------------------
 * buildFormStateFromSchema
 * -----------------------------------------------------------------------------
 *
 * Creates a safe editable object from a source object using a schema.
 *
 * PURPOSE:
 * - filters object fields by schema visibility
 * - projects only allowed fields
 * - rebuilds nested object structure
 * - prevents hidden/server-only fields from entering form state
 *
 * -----------------------------------------------------------------------------
 *
 * This acts as a projection layer between:
 *
 *   backend/domain objects
 *                 ↓
 *        schema visibility rules
 *                 ↓
 *        editable UI form state
 *
 * -----------------------------------------------------------------------------
 *
 * Supports:
 * - nested object paths
 * - schema-driven visibility
 * - recursive object reconstruction
 *
 * -----------------------------------------------------------------------------
 *
 * Example Source:
 *
 * const user = {
 *   username: "chuck",
 *   password: "secret",
 *   profile: {
 *     bio: "Engineer"
 *   }
 * };
 *
 * -----------------------------------------------------------------------------
 *
 * Example Schema:
 *
 * const schema = {
 *   "username": {
 *     visible: true
 *   },
 *
 *   "profile.bio": {
 *     visible: true
 *   },
 *
 *   "password": {
 *     visible: false
 *   }
 * };
 *
 * -----------------------------------------------------------------------------
 *
 * Result:
 *
 * {
 *   username: "chuck",
 *   profile: {
 *     bio: "Engineer"
 *   }
 * }
 *
 * -----------------------------------------------------------------------------
 *
 * Notes:
 *
 * - Invisible fields are excluded entirely
 * - Missing source values are skipped
 * - Returned object is deeply cloned
 * - Result preserves nested object structure
 *
 * -----------------------------------------------------------------------------
 */

export const buildFormStateFromSchema = (
    source = {},
    schema = {}
) => {

    const result = {};

    for (const [fieldKey, config] of Object.entries(schema)) {

        /**
         * ---------------------------------------------------------------------
         * Skip invisible fields
         * ---------------------------------------------------------------------
         */

        if (config.visible === false) {
            continue;
        }

        /**
         * ---------------------------------------------------------------------
         * Resolve nested source value
         * ---------------------------------------------------------------------
         */

        const path = fieldKey.split(".");

        const value = getNestedValue(
            source,
            path
        );

        /**
         * ---------------------------------------------------------------------
         * Skip missing values
         * ---------------------------------------------------------------------
         */

        if (value === undefined) {
            continue;
        }

        /**
         * ---------------------------------------------------------------------
         * Rebuild nested structure in result object
         * ---------------------------------------------------------------------
         */

        setNestedValue(
            result,
            path,
            structuredClone(value)
        );
    }

    return result;
};
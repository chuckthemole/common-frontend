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

export const appendScript = (scriptToAppend) => {
    const script = document.createElement("script");
    script.src = scriptToAppend;
    script.async = true;
    document.body.appendChild(script);
}
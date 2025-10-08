import { useEffect, useState, useCallback } from "react";
import { getApi } from "../../../api";
import logger from "../../../logger";

/**
 * useNotionUsers
 * Custom React hook to fetch users from a Notion integration endpoint.
 *
 * Uses the shared `getApi()` client for consistent base URL, headers, and error handling.
 * Handles both network and data-level errors, logging all stages for easier debugging.
 *
 * @param {string} integrationKey - The integration key configured on the backend (e.g. "consoleIntegration")
 * @returns {object} - { users, loading, error, refresh }
 */
export function useNotionUsers(integrationKey) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Fetch Notion users from the backend
     * Uses your central Axios instance via getApi()
     */
    const fetchUsers = useCallback(async () => {
        if (!integrationKey) {
            const msg = "No integration key provided to useNotionUsers.";
            logger.error(msg);
            setError(msg);
            return;
        }

        setLoading(true);
        setError(null);

        const api = getApi();
        const url = `/notion-api/integrations/notion/${integrationKey}/users`;
        const baseUrl = api.defaults?.baseURL || "";
        const fullUrl = `${baseUrl}${url}`;

        logger.debug(`[useNotionUsers] Fetching users from: ${fullUrl}`);
        logger.debug(`[useNotionUsers] Fetching users from: ${url}`);

        try {
            const response = await api.get(url);
            logger.debug(`[useNotionUsers] Response received:`, response);

            const data = response.data;

            if (!data || typeof data !== "object") {
                logger.error("[useNotionUsers] Invalid response format:", data);
                throw new Error("Invalid response format: expected JSON object.");
            }

            // Normalize Notion API user data
            const normalized = (data.results || []).map((user) => ({
                id: user.id,
                name: user.name,
                email: user.person?.email || null,
                type: user.type,
                avatar: user.avatar_url || null,
            }));

            setUsers(normalized);
            logger.info(`[useNotionUsers] Loaded ${normalized.length} users successfully.`);
        } catch (err) {
            // Handle Axios-style errors
            if (err.response) {
                logger.error("[useNotionUsers] API error response:", {
                    status: err.response.status,
                    data: err.response.data,
                });
                setError(`Request failed: ${err.response.status}`);
            } else if (err.request) {
                logger.error("[useNotionUsers] No response received:", err.request);
                setError("No response received from backend.");
            } else {
                logger.error("[useNotionUsers] Unexpected error:", err.message);
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    }, [integrationKey]);

    // Fetch users automatically when the hook mounts or integrationKey changes
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return { users, loading, error, refresh: fetchUsers };
}

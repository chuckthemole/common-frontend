import { useEffect, useState, useCallback, useMemo } from "react";
import { getApi } from "../../../api";
import logger from "../../../logger";

/**
 * useNotionUsers
 * Fetches and optionally filters Notion users from a backend integration endpoint.
 *
 * @param {string} integrationKey - Integration key configured on the backend (e.g. "consoleIntegration")
 * @param {object} [options] - Optional configuration
 * @param {string} [options.filter] - Case-insensitive string to filter users by name or email
 * @param {(user: object) => boolean} [options.filterFn] - Optional custom filter callback (overrides string filter)
 * @returns {object} - { users, filteredUsers, loading, error, refresh, setFilter }
 */
export function useNotionUsers(integrationKey, options = {}) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState(options.filter || "");

    /**
     * Fetch Notion users from the backend.
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

        logger.debug(`[useNotionUsers] Fetching users from: ${url}`);

        try {
            const response = await api.get(url);
            const data = response.data;

            if (!data || typeof data !== "object") {
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
            if (err.response) {
                logger.error("[useNotionUsers] API error:", {
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

    /**
     * Fetch users when the integration key changes.
     */
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    /**
     * Compute filtered user list (memoized for performance).
     */
    const filteredUsers = useMemo(() => {
        if (!users?.length) return [];

        // If a custom filter function is provided, use that
        if (typeof options.filterFn === "function") {
            return users.filter(options.filterFn);
        }

        // Otherwise, apply a simple case-insensitive string match
        const query = filter?.trim().toLowerCase();
        if (!query) return users;

        return users.filter(
            (u) =>
                u.name?.toLowerCase().includes(query) ||
                u.email?.toLowerCase().includes(query)
        );
    }, [users, filter, options.filterFn]);

    return {
        users,            // raw data
        filteredUsers,    // filtered view
        loading,
        error,
        refresh: fetchUsers,
        filter,
        setFilter,        // expose setter so consumer can control search
    };
}

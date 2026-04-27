import { useCallback, useEffect, useMemo, useState } from "react";
import logger from "../../logger";
import { ApiPersistence } from "../../persistence";
import { useAuth } from "../auth_context";

/**
 * useUser
 *
 * A persistence-driven hook for the current authenticated user.
 *
 * Design:
 * - Treats user as a singleton resource (no key required)
 * - Uses ApiPersistence as the abstraction layer
 * - Allows endpoint injection for flexibility
 */
export default function useUser({
    autoFetch = true,
    endpoints = {
        get: "/api/user/me",
        update: "/api/user/me",
        delete: "/api/user/me",
    },
} = {}) {
    const { isAuthenticated } = useAuth();

    /**
     * Persistence layer
     */
    const userStore = useMemo(() => {
        return ApiPersistence({
            get: endpoints.get,
            update: endpoints.update,
            delete: endpoints.delete,
        });
    }, [endpoints]);

    /**
     * State
     */
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // ---------------------------------------------------------------------
    // FETCH
    // ---------------------------------------------------------------------
    const fetchUser = useCallback(async () => {
        logger.groupCollapsed?.("[useUser] fetchUser()");

        if (!isAuthenticated) {
            logger.debug("[useUser] Not authenticated → skipping fetch");
            setUser(null);
            logger.groupEnd?.();
            return null;
        }

        setLoading(true);
        setError(null);

        logger.debug("[useUser] Starting fetch...");
        logger.debug("[useUser] Endpoint:", endpoints.get);

        try {
            const data = await userStore.getItem(null); // singleton

            logger.debug("[useUser] Raw response:", data);

            if (!data) {
                logger.warn("[useUser] No user returned from API");
            }

            setUser(data);

            logger.debug("[useUser] State updated → user set");

            return data;
        } catch (err) {
            logger.error("[useUser] Fetch failed:", err);

            setError("Failed to load user");

            return null;
        } finally {
            setLoading(false);

            logger.debug("[useUser] Loading complete");
            logger.groupEnd?.();
        }
    }, [isAuthenticated, userStore]);

    // ---------------------------------------------------------------------
    // UPDATE (partial)
    // ---------------------------------------------------------------------
    const updateUser = useCallback(
        async (updates) => {
            if (!isAuthenticated) return null;

            setLoading(true);
            setError(null);

            try {
                // NOTE: ApiPersistence.updateItem does NOT return data
                await userStore.updateItem(null, updates);

                // optimistic merge (safe fallback)
                setUser((prev) => ({ ...prev, ...updates }));

                logger.debug("[useUser] updated", updates);

                return updates;
            } catch (err) {
                logger.error("[useUser] update failed", err);
                setError("Failed to update user");
                return null;
            } finally {
                setLoading(false);
            }
        },
        [isAuthenticated, userStore]
    );

    // ---------------------------------------------------------------------
    // DELETE
    // ---------------------------------------------------------------------
    const deleteUser = useCallback(async () => {
        if (!isAuthenticated) return false;

        setLoading(true);
        setError(null);

        try {
            await userStore.removeItem(null);
            setUser(null);

            logger.warn("[useUser] deleted");

            return true;
        } catch (err) {
            logger.error("[useUser] delete failed", err);
            setError("Failed to delete user");
            return false;
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, userStore]);

    // ---------------------------------------------------------------------
    // EFFECTS
    // ---------------------------------------------------------------------
    useEffect(() => {
        if (autoFetch) {
            fetchUser();
        }
    }, [autoFetch, fetchUser]);

    // ---------------------------------------------------------------------
    // DERIVED STATE
    // ---------------------------------------------------------------------
    const isLoaded = !loading && user !== null;

    // ---------------------------------------------------------------------
    // PUBLIC API
    // ---------------------------------------------------------------------
    return {
        user,
        loading,
        error,

        fetchUser,
        refresh: fetchUser,
        updateUser,
        deleteUser,

        isAuthenticated,
        isLoaded,
    };
}
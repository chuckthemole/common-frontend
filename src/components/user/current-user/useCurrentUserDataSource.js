import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import logger, { useScopedLogger } from "../../../logger";
import { ApiPersistence } from "../../../persistence";
import { useAuth } from "../../auth";

/**
 * useCurrentUserDataSource
 *
 * A persistence-driven hook for the current authenticated user.
 *
 * Design:
 * - Treats user as a singleton resource (no key required)
 * - Uses ApiPersistence as the abstraction layer
 * - Allows endpoint injection for flexibility
 */
export default function useCurrentUserDataSource({
    autoFetch = true,
    endpoints = {
        get: "/api/user/me",
        update: "/api/user/me",
        delete: "/api/user/me",
    },
} = {}) {

    const SCOPED_LOGGER = useScopedLogger("useCurrentUserDataSource", logger);
    const { isAuthenticated } = useAuth();
    const inFlightRef = useRef(false);
    const hasLoadedRef = useRef(false);

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
        if (inFlightRef.current) return null;
        if (hasLoadedRef.current) return user;

        inFlightRef.current = true;

        SCOPED_LOGGER.groupCollapsed?.("fetchUser start");

        try {
            if (!isAuthenticated) {
                setUser(null);
                return null;
            }

            setLoading(true);
            setError(null);

            const data = await userStore.customGet(endpoints.get);

            setUser(data);

            hasLoadedRef.current = true;

            return data;
        } catch (err) {
            SCOPED_LOGGER.error("Fetch failed:", err);
            setError("Failed to load user");
            return null;
        } finally {
            inFlightRef.current = false;
            setLoading(false);
            SCOPED_LOGGER.groupEnd?.();
        }
    }, [isAuthenticated, userStore, endpoints.get]);

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

                SCOPED_LOGGER.debug("updated", updates);

                return updates;
            } catch (err) {
                SCOPED_LOGGER.error("update failed", err);
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

            SCOPED_LOGGER.warn("deleted");

            return true;
        } catch (err) {
            SCOPED_LOGGER.error("delete failed", err);
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

    useEffect(() => {
        SCOPED_LOGGER.debug("isAuthenticated changed:", isAuthenticated);
    }, [isAuthenticated]);

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
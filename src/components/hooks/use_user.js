import { useCallback, useEffect, useMemo, useState } from 'react';
import logger from '../logger';
import { ApiPersistence } from '../persistence/api_persistence';
import { useAuth } from '../auth_context';

/**
 * useUser
 *
 * Central hook for interacting with the current authenticated user.
 * Uses ApiPersistence for CRUD operations.
 *
 * Responsibilities:
 * - Fetch current user
 * - Update user fields
 * - Delete user
 * - Expose loading + error states
 *
 * This hook does NOT:
 * - Render UI
 * - Handle routing
 * - Handle login/logout
 */
export default function useUser({
    autoFetch = true,     // fetch user on mount
} = {}) {
    const { isAuthenticated } = useAuth();

    const userApi = useMemo(
        () =>
            ApiPersistence({
                get: '/api/user/me',
                update: '/api/user/me',
                delete: '/api/user/me',
            }),
        []
    );

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // ---------------------------------------------------------------------
    // Fetch
    // ---------------------------------------------------------------------
    const fetchUser = useCallback(async () => {
        if (!isAuthenticated) {
            setUser(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await userApi.getItem();
            setUser(data);
            logger.debug('[useUser] User fetched', data);
        } catch (err) {
            logger.error('[useUser] Failed to fetch user', err);
            setError('Failed to load user');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, userApi]);

    // ---------------------------------------------------------------------
    // Update (partial)
    // ---------------------------------------------------------------------
    const updateUser = useCallback(
        async (updates) => {
            if (!isAuthenticated) return null;

            setLoading(true);
            setError(null);

            try {
                const updated = await userApi.updateItem(null, updates);
                setUser((prev) => ({ ...prev, ...updated }));
                logger.debug('[useUser] User updated', updates);
                return updated;
            } catch (err) {
                logger.error('[useUser] Failed to update user', err);
                setError('Failed to update user');
                return null;
            } finally {
                setLoading(false);
            }
        },
        [isAuthenticated, userApi]
    );

    // ---------------------------------------------------------------------
    // Delete
    // ---------------------------------------------------------------------
    const deleteUser = useCallback(async () => {
        if (!isAuthenticated) return false;

        setLoading(true);
        setError(null);

        try {
            await userApi.removeItem();
            setUser(null);
            logger.warn('[useUser] User deleted');
            return true;
        } catch (err) {
            logger.error('[useUser] Failed to delete user', err);
            setError('Failed to delete user');
            return false;
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, userApi]);

    // ---------------------------------------------------------------------
    // Effects
    // ---------------------------------------------------------------------
    useEffect(() => {
        if (autoFetch) {
            fetchUser();
        }
    }, [autoFetch, fetchUser]);

    // ---------------------------------------------------------------------
    // Public API
    // ---------------------------------------------------------------------
    return {
        user,
        loading,
        error,

        // actions
        fetchUser,
        refresh: fetchUser,
        updateUser,
        deleteUser,

        // derived
        isAuthenticated,
        isLoaded: !loading && user !== null,
    };
}

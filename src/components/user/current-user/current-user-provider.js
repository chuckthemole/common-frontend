import React, { useMemo, useEffect } from "react";
import CurrentUserContext from "./current-user-context";
import useUser from "./useCurrentUserDataSource";
import logger, { useScopedLogger } from "../../../logger";

export default function CurrentUserProvider({ children }) {
    const SCOPED_LOGGER = useScopedLogger("CurrentUserProvider", logger);

    const {
        user,
        loading,
        isAuthenticated,
        // refetch, todo
    } = useUser({
        autoFetch: true,
        endpoints: {
            get: "/api/current_user", // TODO: hardcoded
        },
        // TODO:
        // cache: { enabled: true, ttl: 5 * 60 * 1000 }
    });

    /**
     * Debug user shape (clean + isolated)
     */
    useEffect(() => {
        if (loading) return;

        SCOPED_LOGGER.debug("user updated", {
            user,
            isAuthenticated,
        });
    }, [user, isAuthenticated, loading]);

    /**
     * Actions (keep these minimal + stable)
     */
    const refreshUser = async () => {
        SCOPED_LOGGER.debug("refreshUser called");
        await refetch?.();
    };

    const logout = async () => {
        SCOPED_LOGGER.debug("logout called");

        // call your API if needed
        // await api.post("/logout");

        // simplest version:
        window.location.reload();
    };

    /**
     * Context value (memoized)
     */
    const value = useMemo(() => {
        return {
            user,
            loading,
            isAuthenticated: !!isAuthenticated,

            // actions
            refreshUser,
            logout,
        };
    }, [user, loading, isAuthenticated]);

    return (
        <CurrentUserContext.Provider value={value}>
            {children}
        </CurrentUserContext.Provider>
    );
}
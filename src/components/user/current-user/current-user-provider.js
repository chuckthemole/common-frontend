import React, { useMemo, useEffect, useState } from "react";
import CurrentUserContext from "./current-user-context";
import useUser from "./useCurrentUserDataSource";
import logger, { useScopedLogger } from "../../../logger";
import { getApi } from "../../../api/client/api";

const ROLE_ADMIN = "ROLE_ADMIN";

export default function CurrentUserProvider({ children }) {
    const SCOPED_LOGGER = useScopedLogger("CurrentUserProvider", logger);

    const [userAuthorities, setUserAuthorities] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);

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
     * Debug user shape
     */
    useEffect(() => {
        if (loading) {
            SCOPED_LOGGER.debug(
                "[AuthEffect] still loading, skipping authority extraction"
            );

            return;
        }

        SCOPED_LOGGER.debug(
            "[AuthEffect] auth state updated",
            {
                user,
                isAuthenticated,
            }
        );
    }, [user, isAuthenticated]);

    /**
     * Set user auths
     */
    useEffect(() => {
        /**
         * -------------------------------------------------------------
         * Debug object traversal step-by-step
         * -------------------------------------------------------------
         */
        SCOPED_LOGGER.debug(
            "[AuthEffect] user exists?",
            !!user
        );

        SCOPED_LOGGER.debug(
            "[AuthEffect] user.userDetails exists?",
            !!user?.userDetails
        );

        SCOPED_LOGGER.debug(
            "[AuthEffect] authorities raw value",
            user?.userDetails?.authorities
        );

        SCOPED_LOGGER.debug(
            "[AuthEffect] authorities is array?",
            Array.isArray(
                user?.userDetails?.authorities
            )
        );

        /**
         * -------------------------------------------------------------
         * Extract authorities
         * -------------------------------------------------------------
         */
        const auths =
            user?.userDetails?.authorities?.map(
                (auth, index) => {
                    SCOPED_LOGGER.debug(
                        `[AuthEffect] mapping authority index=${index}`,
                        auth
                    );

                    return auth?.authority;
                }
            ) || [];

        SCOPED_LOGGER.debug(
            "[AuthEffect] extracted authorities",
            auths
        );

        setUserAuthorities(auths);

        SCOPED_LOGGER.debug(
            "[AuthEffect] userAuthorities state updated",
            {
                authsLength: auths.length,
                auths,
            }
        );
    }, [user, loading]);

    useEffect(() => {
        setIsAdmin((userAuthorities || []).includes(ROLE_ADMIN));
    }, [userAuthorities]);

    /**
     * Actions (keep these minimal + stable)
     */
    const refreshUser = async () => {
        SCOPED_LOGGER.debug("refreshUser called");
        await refetch?.();
    };

    const logout = async ({
        reload = true,
        onLogout,
    } = {}) => {

        SCOPED_LOGGER.debug(
            "logout called"
        );

        try {

            const api = getApi();

            await api.post(
                "/auth/logout"
            );

        } catch (err) {

            SCOPED_LOGGER.error(
                "Logout API failed",
                err
            );
        }

        /**
         * -------------------------------------------------------------------------
         * Clear local auth state
         * -------------------------------------------------------------------------
         */

        setUserAuthorities([]);
        setIsAdmin(false);

        /**
         * -------------------------------------------------------------------------
         * Optional logout callback
         * -------------------------------------------------------------------------
         */

        if (typeof onLogout === "function") {
            await onLogout();
        }

        /**
         * -------------------------------------------------------------------------
         * Reload application
         * -------------------------------------------------------------------------
         */

        if (reload) {
            window.location.reload();
        }
    };

    /**
     * Context value (memoized)
     */
    const value = useMemo(() => {
        return {
            user,
            loading,
            isAuthenticated: !!isAuthenticated,
            userAuthorities,
            isAdmin,

            // actions
            refreshUser,
            logout,
        };
    }, [user, loading, isAuthenticated, userAuthorities, isAdmin]);

    return (
        <CurrentUserContext.Provider value={value}>
            {children}
        </CurrentUserContext.Provider>
    );
}
import {
    useEffect,
    useState,
    useCallback,
    useMemo,
} from "react";

import {
    getUserApi,
} from "../../../api/modules/user/user-api";

import logger from "../../../logger";

/**
 * -----------------------------------------------------------------------------
 * useUser
 * -----------------------------------------------------------------------------
 *
 * Fetches and manages a single user.
 *
 * Features:
 *  - automatic loading lifecycle
 *  - refresh support
 *  - cancellation safety
 *  - reactive to userId changes
 *
 * -----------------------------------------------------------------------------
 */

export function useUser(
    userId,
    {
        enabled = true,
    } = {}
) {

    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(enabled);

    const [error, setError] = useState(null);

    const userApi = useMemo(
        () => getUserApi(),
        []
    );

    /**
     * -------------------------------------------------------------------------
     * Fetch User
     * -------------------------------------------------------------------------
     */
    const fetchUser =
        useCallback(async (cancelledRef) => {

            if (!enabled) {

                logger.debug(
                    "[useUser] disabled"
                );

                setLoading(false);

                return;
            }

            if (!userId) {

                logger.warn(
                    "[useUser] missing userId"
                );

                setLoading(false);

                return;
            }

            try {

                logger.debug(
                    "[useUser] fetch start",
                    { userId }
                );

                setLoading(true);

                const data =
                    await userApi.getUser({
                        id: userId,
                    });

                logger.debug(
                    "[useUser] fetch success",
                    {
                        userId,
                        data,
                    }
                );

                if (
                    cancelledRef.current
                ) {

                    logger.debug(
                        "[useUser] request resolved after cancellation"
                    );

                    return;
                }

                setUser(data);

                setError(null);

            } catch (err) {

                logger.error(
                    "[useUser] fetch failed",
                    {
                        userId,
                        error: err,
                        message:
                            err?.message,
                        stack:
                            err?.stack,
                    }
                );

                if (
                    cancelledRef.current
                ) {
                    return;
                }

                setError(err);

            } finally {

                if (
                    cancelledRef.current
                ) {
                    return;
                }

                setLoading(false);

                logger.debug(
                    "[useUser] loading=false"
                );
            }

        }, [
            userApi,
            userId,
        ]);

    /**
     * -------------------------------------------------------------------------
     * Initial Fetch
     * -------------------------------------------------------------------------
     */

    useEffect(() => {

        const cancelledRef = {
            current: false,
        };

        logger.debug(
            "[useUser] effect start",
            { userId }
        );

        fetchUser(
            cancelledRef
        );

        return () => {

            logger.debug(
                "[useUser] cleanup -> cancelling request",
                { userId }
            );

            cancelledRef.current =
                true;
        };

    }, [
        fetchUser,
        userId,
    ]);

    /**
     * -------------------------------------------------------------------------
     * Refresh
     * -------------------------------------------------------------------------
     */

    const refreshUser =
        useCallback(async () => {

            logger.debug(
                "[useUser] refreshUser()"
            );

            const cancelledRef = {
                current: false,
            };

            await fetchUser(
                cancelledRef
            );

        }, [
            fetchUser,
        ]);

    /**
     * -------------------------------------------------------------------------
     * Return
     * -------------------------------------------------------------------------
     */

    logger.debug(
        "[useUser] return",
        {
            user,
            loading,
            error,
        }
    );

    return {
        user,
        loading,
        error,
        refreshUser,
    };
}
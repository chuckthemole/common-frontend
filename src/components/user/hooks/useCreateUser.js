import {
    useState,
    useCallback,
    useMemo,
    useRef,
    useEffect,
} from "react";

import {
    getUserApi,
} from "../../../api/modules/user/user-api";

import logger from "../../../logger";

/**
 * -----------------------------------------------------------------------------
 * useCreateUser
 * -----------------------------------------------------------------------------
 *
 * Creates a new user.
 *
 * Features:
 *  - loading state
 *  - error handling
 *  - cancellation safety
 *  - stable API reference
 *
 * -----------------------------------------------------------------------------
 */
export function useCreateUser() {

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState(null);

    const mountedRef =
        useRef(true);

    const userApi = useMemo(
        () => getUserApi(),
        []
    );

    /**
     * -------------------------------------------------------------------------
     * Mounted State Tracking
     * -------------------------------------------------------------------------
     */

    useEffect(() => {

        mountedRef.current = true;

        return () => {

            logger.debug(
                "[useCreateUser] cleanup -> unmounted"
            );

            mountedRef.current = false;
        };

    }, []);

    /**
     * -------------------------------------------------------------------------
     * Create User
     * -------------------------------------------------------------------------
     */

    const createUser =
        useCallback(async (
            createUserRequest
        ) => {

            logger.debug(
                "[useCreateUser] createUser() start",
                {
                    request:
                        createUserRequest,
                }
            );

            try {

                if (
                    mountedRef.current
                ) {
                    setLoading(true);
                    setError(null);
                }

                const response =
                    await userApi.createUser(
                        createUserRequest
                    );

                logger.debug(
                    "[useCreateUser] createUser() success",
                    {
                        response,
                    }
                );

                return {
                    success: true,
                    data: response,
                };

            } catch (err) {

                logger.error(
                    "[useCreateUser] createUser() failed",
                    {
                        error: err,
                        message: err?.message,
                        stack: err?.stack,
                    }
                );

                if (mountedRef.current) {

                    const errorMessage =
                        err?.response?.data?.message ||
                        err?.response?.data?.error ||
                        err?.message ||
                        "Failed to create user.";

                    logger.error(
                        "[useCreateUser] createUser() failed",
                        {
                            error: errorMessage,
                        }
                    );

                    setError(errorMessage);
                }

                return {
                    success: false,
                    error: err,
                };

            } finally {

                if (mountedRef.current) {
                    setLoading(false);
                }

                logger.debug(
                    "[useCreateUser] loading=false"
                );
            }

        }, [userApi,]);

    /**
     * -------------------------------------------------------------------------
     * Return
     * -------------------------------------------------------------------------
     */

    logger.debug(
        "[useCreateUser] return",
        {
            loading,
            error,
        }
    );

    return {
        createUser,
        loading,
        error,
        resetError: () => setError(null),
    };
}
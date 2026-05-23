import { useEffect, useState } from "react";
import { getUserApi } from "../../api/modules/user/user-api";
import logger from "../../logger";

export function useUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    logger.debug("[useUsers] hook render", {
        usersCount: users.length,
        loading,
        error,
    });

    const userApi = getUserApi();

    useEffect(() => {
        let cancelled = false;

        logger.debug("[useUsers] effect start", {
            cancelled,
        });

        logger.debug("[useUsers] calling api.getAll()", {
            endpoint: "/api/users/asc",
        });

        userApi.getAllUsers()
            .then((data) => {
                logger.debug("[useUsers] api.getAll() success", {
                    data,
                    type: typeof data,
                    isArray: Array.isArray(data),
                    length: Array.isArray(data) ? data.length : undefined,
                });

                if (cancelled) {
                    logger.debug(
                        "[useUsers] request resolved after cancellation"
                    );
                    return;
                }

                setUsers(data);

                logger.debug("[useUsers] users state updated", {
                    usersCount: Array.isArray(data) ? data.length : undefined,
                });
            })
            .catch((err) => {
                logger.error("[useUsers] api.getAll() failed", {
                    error: err,
                    message: err?.message,
                    stack: err?.stack,
                });

                if (cancelled) {
                    logger.debug(
                        "[useUsers] error occurred after cancellation"
                    );
                    return;
                }

                setError(err);
            })
            .finally(() => {
                logger.debug("[useUsers] request finally()", {
                    cancelled,
                });

                if (cancelled) {
                    return;
                }

                setLoading(false);

                logger.debug("[useUsers] loading=false");
            });

        return () => {
            logger.debug("[useUsers] cleanup -> cancelling request");

            cancelled = true;
        };
    }, []);

    logger.debug("[useUsers] return", {
        users,
        loading,
        error,
    });

    return {
        users,
        loading,
        error,
    };
}
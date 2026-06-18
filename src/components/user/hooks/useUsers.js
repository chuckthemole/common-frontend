import { useEffect, useRef, useState, useCallback } from "react";
import { getUserApi } from "../../../api/modules/user/user-api";
import logger from "../../../logger";

/**
 * query shape:
 * {
 *   sort: "USERNAME" | "EMAIL" | "ID",
 *   direction: "ASC" | "DESC",
 *   page: number,
 *   size: number
 * }
 */
export function useUsers(query = {}) {

    const {
        sort = "USERNAME",
        direction = "DESC",
        page = 0,
        size = 50,
    } = query;

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const cancelRef = useRef(false);
    const userApi = getUserApi();

    const fetchUsers = useCallback(() => {

        setLoading(true);
        setError(null);

        logger.debug("[useUsers] fetch start", {
            sort,
            direction,
            page,
            size,
        });

        return userApi.getAllUsers({
            params: {
                sort,
                direction,
                page,
                size,
            },
        })
            .then((data) => {

                if (cancelRef.current) {
                    logger.debug("[useUsers] ignored stale response");
                    return;
                }

                setUsers(data ?? []);
            })
            .catch((err) => {

                if (cancelRef.current) return;

                logger.error("[useUsers] failed", err);
                setError(err);
            })
            .finally(() => {

                if (cancelRef.current) return;

                setLoading(false);
            });

    }, [userApi, sort, direction, page, size]);

    useEffect(() => {

        cancelRef.current = false;

        fetchUsers();

        return () => {
            cancelRef.current = true;
        };

    }, [fetchUsers]);

    return {
        users,
        loading,
        error,
        refresh: fetchUsers,
        query: {
            sort,
            direction,
            page,
            size,
        },
    };
}
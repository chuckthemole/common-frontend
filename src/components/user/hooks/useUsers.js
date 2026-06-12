import { useEffect, useRef, useState } from "react";
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

    useEffect(() => {

        cancelRef.current = false;
        setLoading(true);
        setError(null);

        logger.debug("[useUsers] fetch start", {
            sort,
            direction,
            page,
            size,
        });

        userApi.getAllUsers({
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

                logger.debug("[useUsers] success", {
                    count: Array.isArray(data) ? data.length : 0,
                });

                setUsers(data ?? []);
            })
            .catch((err) => {

                if (cancelRef.current) return;

                logger.error("[useUsers] failed", {
                    message: err?.message,
                    status: err?.status,
                });

                setError(err);
            })
            .finally(() => {

                if (cancelRef.current) return;

                setLoading(false);
            });

        return () => {
            cancelRef.current = true;
        };

    }, [sort, direction, page, size]);

    return {
        users,
        loading,
        error,
        query: {
            sort,
            direction,
            page,
            size,
        },
    };
}
import { useCallback, useState } from "react";

/**
 * Generic sortable state manager
 */
export function useSort(initialKey, initialDirection = "asc") {

    const [sortConfig, setSortConfig] = useState({
        key: initialKey,
        direction: initialDirection,
    });

    const toggleSort = useCallback((key) => {
        setSortConfig((prev) => {

            if (prev.key === key) {
                return {
                    key,
                    direction: prev.direction === "asc" ? "desc" : "asc",
                };
            }

            return {
                key,
                direction: "asc",
            };
        });
    }, []);

    const setSort = useCallback((key, direction) => {
        setSortConfig({ key, direction });
    }, []);

    const isSortedBy = useCallback(
        (key) => sortConfig.key === key,
        [sortConfig.key]
    );

    const sortIndicator = useCallback(
        (key) => {
            if (sortConfig.key !== key) return null;
            return sortConfig.direction;
        },
        [sortConfig]
    );

    return {
        sortConfig,
        setSort,
        toggleSort,
        isSortedBy,
        sortIndicator,
    };
}
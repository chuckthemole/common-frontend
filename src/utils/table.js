export function sortRows(rows, sortConfig) {
    if (!sortConfig?.key) return rows;

    const sorted = [...rows].sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (aVal == null) return 1;
        if (bVal == null) return -1;

        if (sortConfig.key === "timestamp") {
            return new Date(aVal) - new Date(bVal);
        }

        if (typeof aVal === "number" && typeof bVal === "number") {
            return aVal - bVal;
        }

        return String(aVal).localeCompare(String(bVal));
    });

    return sortConfig.direction === "asc" ? sorted : sorted.reverse();
}

export function getColumns(rows) {
    const keys = new Set();

    for (const row of rows) {
        Object.keys(row).forEach(k => keys.add(k));
    }

    return Array.from(keys);
}
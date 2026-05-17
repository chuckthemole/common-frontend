export function flattenEvent(event, options = {}) {
    const { isHomogeneous } = options;

    const base = {
        timestamp: event.timestamp,
        ID: event.context?.userId ?? null,
        username: event.context?.username ?? null,
        component: event.entity,
        action: event.action,
    };

    if (isHomogeneous) {
        return {
            ...base,
            ...event.metadata,
        };
    }

    return {
        ...base,
        metadata: event.metadata,
    };
}

export function isHomogeneousMetadata(events) {
    if (!events.length) return true;

    const firstKeys = Object.keys(events[0]?.metadata || {}).sort().join(",");

    return events.every(e =>
        Object.keys(e?.metadata || {}).sort().join(",") === firstKeys
    );
}
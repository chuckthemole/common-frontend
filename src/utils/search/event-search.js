export function parseSearchQuery(query) {
    const tokens = query
        .toLowerCase()
        .split(" ")
        .map(t => t.trim())
        .filter(Boolean);

    const structured = {};
    const freeText = [];

    for (const token of tokens) {
        const [key, value] = token.split(":");

        if (value) structured[key] = value;
        else freeText.push(token);
    }

    return { structured, freeText };
}

export function filterEvents(events, query, fieldMapper) {
    const { structured, freeText } = parseSearchQuery(query);

    return events.filter(event => {
        const flat = fieldMapper(event);

        for (const key in structured) {
            const val = flat[key];
            if (!val || !String(val).toLowerCase().includes(structured[key])) {
                return false;
            }
        }

        if (freeText.length > 0) {
            const combined = Object.values(flat)
                .map(v => (typeof v === "object" ? JSON.stringify(v) : String(v)))
                .join(" ")
                .toLowerCase();

            return freeText.every(term => combined.includes(term));
        }

        return true;
    });
}
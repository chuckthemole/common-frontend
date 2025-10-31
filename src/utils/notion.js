/**
 * transformNotionRow
 *
 * Converts a raw Notion database page object into a flat, display-friendly row.
 * Handles common property types like title, rich_text, number, select, multi_select, date, people, checkbox, url, and email.
 * Unsupported or nested objects are stringified.
 *
 * @param {Object} row - Raw Notion page object
 * @returns {Object} - Transformed row with key-value pairs suitable for table rendering
 */
export function transformNotionRow(row) {
    if (!row || !row.properties) return {};

    const transformed = {};

    for (const [key, valueObj] of Object.entries(row.properties)) {
        if (!valueObj) {
            transformed[key] = "";
            continue;
        }

        switch (valueObj.type) {
            case "title":
                transformed[key] = Array.isArray(valueObj.title)
                    ? valueObj.title.map(t => t.plain_text || "").join(" ")
                    : "";
                break;

            case "rich_text":
                transformed[key] = Array.isArray(valueObj.rich_text)
                    ? valueObj.rich_text.map(t => t.plain_text || "").join(" ")
                    : "";
                break;

            case "number":
                transformed[key] = valueObj.number ?? "";
                break;

            case "select":
                transformed[key] = valueObj.select?.name || "";
                break;

            case "multi_select":
                transformed[key] = Array.isArray(valueObj.multi_select)
                    ? valueObj.multi_select.map(sel => sel.name || "").join(", ")
                    : "";
                break;

            case "date":
                transformed[key] = valueObj.date?.start || "";
                break;

            case "people":
                transformed[key] = Array.isArray(valueObj.people)
                    ? valueObj.people.map(p => p.name || p.id || "").join(", ")
                    : "";
                break;

            case "checkbox":
                transformed[key] = valueObj.checkbox ?? false;
                break;

            case "url":
                transformed[key] = valueObj.url || "";
                break;

            case "email":
                transformed[key] = valueObj.email || "";
                break;

            default:
                // Fallback for unsupported or nested objects
                transformed[key] = JSON.stringify(valueObj);
        }
    }

    return transformed;
}

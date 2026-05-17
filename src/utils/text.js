export function highlightText(text, query) {
    if (!query?.trim()) return text;

    const terms = query.toLowerCase().split(" ").filter(Boolean);

    let str = String(text);

    for (const term of terms) {
        const regex = new RegExp(`(${term})`, "gi");
        str = str.replace(regex, "<mark>$1</mark>");
    }

    return str;
}
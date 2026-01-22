/* ============================================================
   Constants
   ============================================================ */
export const PAGE_STORAGE_KEY = "personal-page:draft";

/* ============================================================
   Default Page Schema
   ============================================================ */
export const DEFAULT_PAGE = {
    theme: "modern",
    sections: [
        {
            id: "home",
            type: "home",
            enabled: true,
            showTitle: false,
            defaultTitle: "Home",
            title: "Home",
            data: { name: "", tagline: "", profileImage: "" },
        },
        {
            id: "about",
            type: "about",
            enabled: true,
            showTitle: true,
            defaultTitle: "About",
            title: "About",
            data: { content: "" },
        },
        {
            id: "projects",
            type: "projects",
            enabled: true,
            showTitle: true,
            defaultTitle: "Projects",
            title: "Projects",
            data: { items: [], layout: "carousel", itemsPerPage: 3 },
        },
        {
            id: "contact",
            type: "contact",
            enabled: true,
            showTitle: true,
            defaultTitle: "Contact",
            title: "Contact",
            data: { email: "" },
        },
    ],
};

// Available themes
export const THEMES = [
    { value: "modern", label: "Modern (default)" },
    { value: "minimal", label: "Minimal" },
    { value: "portfolio", label: "Portfolio Focused" },
];
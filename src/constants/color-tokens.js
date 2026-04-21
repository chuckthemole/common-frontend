/**
 * ============================================================
 * COLOR TOKENS
 * ------------------------------------------------------------
 * These define ALL CSS variable names used in the app.
 *
 * RULES:
 * - JS uses camelCase keys (e.g. pageBackground)
 * - CSS uses kebab-case variables (e.g. --page-background)
 * - SCSS must reference ONLY these variables
 *
 * If you rename a token:
 * update BOTH this file AND SCSS usages
 *
 * SCSS FILES TO CHECK:
 * /common-frontend/styles/
 * ============================================================
 */

export const COLOR_TOKENS = {
    /* ======================================================
       PAGE (global layout)
       Used in:
       - .page-preview-frame
       - .user-profile-preview
       ====================================================== */
    pageBackground: {
        cssVar: "--page-background",
        fallback: "#ffffff",
        description: "Main page background",
    },
    pageText: {
        cssVar: "--page-text",
        fallback: "#333333",
        description: "Primary text color",
    },
    pageTextMuted: {
        cssVar: "--page-text-muted",
        fallback: "#666666",
        description: "Muted / secondary text (subtitles, helpers)",
    },

    /* ======================================================
       SURFACES (cards, panels, layers)
       Used in:
       - .card
       - .modal
       - .editor-header
       ====================================================== */
    surfaceBackground: {
        cssVar: "--surface-background",
        fallback: "#f8f9fb",
        description: "Background for elevated surfaces",
    },
    surfaceText: {
        cssVar: "--surface-text",
        fallback: "#333333",
        description: "Text on surface backgrounds",
    },
    cardBackground: {
        cssVar: "--card-background",
        fallback: "#ffffff",
        description: "Card background",
    },
    cardBorder: {
        cssVar: "--card-border",
        fallback: "#e5e7eb",
        description: "Card border color",
    },

    /* ======================================================
       NAVIGATION
       Used in:
       - .navbar
       - .profile-nav
       ====================================================== */
    navBackground: {
        cssVar: "--nav-background",
        fallback: "#1a1a1a",
        description: "Navigation background",
    },
    navText: {
        cssVar: "--nav-text",
        fallback: "#ffffff",
        description: "Navigation text",
    },
    navHover: {
        cssVar: "--nav-hover",
        fallback: "#f5f5f5",
        description: "Nav hover text color",
    },
    navBorder: {
        cssVar: "--nav-border",
        fallback: "rgba(255,255,255,0.1)",
        description: "Nav border / divider",
    },

    /* ======================================================
       BUTTONS
       Used in:
       - .button
       ====================================================== */
    buttonBackground: {
        cssVar: "--button-background",
        fallback: "#3273dc",
        description: "Button background",
    },
    buttonText: {
        cssVar: "--button-text",
        fallback: "#ffffff",
        description: "Button text",
    },
    buttonHover: {
        cssVar: "--button-hover",
        fallback: "#2759a3",
        description: "Button hover background",
    },
    buttonBorder: {
        cssVar: "--button-border",
        fallback: "transparent",
        description: "Button border",
    },

    /* ======================================================
       LINKS & ACCENTS
       Used in:
       - a
       - .highlight
       - project links
       ====================================================== */
    accentColor: {
        cssVar: "--accent-color",
        fallback: "#ff3860",
        description: "Primary accent color",
    },
    linkColor: {
        cssVar: "--link-color",
        fallback: "#3273dc",
        description: "Link color",
    },
    linkHover: {
        cssVar: "--link-hover",
        fallback: "#2759a3",
        description: "Link hover color",
    },

    /* ======================================================
       BORDERS / UTILITIES
       Used in:
       - .bordered
       - general UI
       ====================================================== */
    borderColor: {
        cssVar: "--border-color",
        fallback: "#e5e7eb",
        description: "Default border color",
    },
    focusRing: {
        cssVar: "--focus-ring",
        fallback: "#3273dc",
        description: "Focus outline color",
    },
};
/**
 * ============================================================
 * COLOR TOKENS
 * ------------------------------------------------------------
 * These define ALL CSS variable names used in the app.
 *
 * RULES:
 * - Keys are simplified + semantic (background, text, nav-text, etc.)
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
    background: {
        cssVar: "--page-background",
        default: "#ffffff",
        description: "Main page background",
    },
    text: {
        cssVar: "--page-text",
        default: "#333333",
        description: "Primary text color",
    },
    "text-muted": {
        cssVar: "--page-text-muted",
        default: "#666666",
        description: "Muted / secondary text (subtitles, helpers)",
    },

    /* ======================================================
       SURFACES (cards, panels, layers)
       Used in:
       - .card
       - .modal
       - .editor-header
       ====================================================== */
    "surface-background": {
        cssVar: "--surface-background",
        default: "#f8f9fb",
        description: "Background for elevated surfaces",
    },
    "surface-text": {
        cssVar: "--surface-text",
        default: "#333333",
        description: "Text on surface backgrounds",
    },
    "card-background": {
        cssVar: "--card-background",
        default: "#ffffff",
        description: "Card background",
    },
    "card-border": {
        cssVar: "--card-border",
        default: "#e5e7eb",
        description: "Card border color",
    },

    /* ======================================================
       NAVIGATION
       Used in:
       - .navbar
       - .profile-nav
       ====================================================== */
    "nav-background": {
        cssVar: "--nav-background",
        default: "#1a1a1a",
        description: "Navigation background",
    },
    "nav-text": {
        cssVar: "--nav-text",
        default: "#ffffff",
        description: "Navigation text",
    },
    "nav-hover": {
        cssVar: "--nav-hover",
        default: "#f5f5f5",
        description: "Nav hover text color",
    },
    "nav-border": {
        cssVar: "--nav-border",
        default: "rgba(255,255,255,0.1)",
        description: "Nav border / divider",
    },

    /* ======================================================
       BUTTONS
       Used in:
       - .button
       ====================================================== */
    "button-background": {
        cssVar: "--button-background",
        default: "#3273dc",
        description: "Button background",
    },
    "button-text": {
        cssVar: "--button-text",
        default: "#ffffff",
        description: "Button text",
    },
    "button-hover": {
        cssVar: "--button-hover",
        default: "#2759a3",
        description: "Button hover background",
    },
    "button-border": {
        cssVar: "--button-border",
        default: "transparent",
        description: "Button border",
    },

    /* ======================================================
       LINKS & ACCENTS
       Used in:
       - a
       - .highlight
       - project links
       ====================================================== */
    accent: {
        cssVar: "--accent-color",
        default: "#ff3860",
        description: "Primary accent color",
    },
    link: {
        cssVar: "--link-color",
        default: "#3273dc",
        description: "Link color",
    },
    "link-hover": {
        cssVar: "--link-hover",
        default: "#2759a3",
        description: "Link hover color",
    },

    /* ======================================================
       BORDERS / UTILITIES
       Used in:
       - .bordered
       - general UI
       ====================================================== */
    border: {
        cssVar: "--border-color",
        default: "#e5e7eb",
        description: "Default border color",
    },
    "focus-ring": {
        cssVar: "--focus-ring",
        default: "#3273dc",
        description: "Focus outline color",
    },
};
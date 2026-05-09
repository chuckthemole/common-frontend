/**
 * -----------------------------------------------------------------------------
 * Toast Position System
 * -----------------------------------------------------------------------------
 *
 * Combines:
 *  1. Anchor positioning (top/bottom + alignment)
 *  2. Container width presets (full, 4/5, 3/5, etc.)
 *
 * This allows flexible UI layouts like:
 *  - full-width top banners
 *  - centered narrow toasts
 *  - right-aligned stacks
 * -----------------------------------------------------------------------------
 */

/**
 * Width presets (separate concern for reuse)
 */
export const TOAST_WIDTHS = {
    full: {
        width: "100%",
    },

    "4/5": {
        width: "80%",
    },

    "3/5": {
        width: "60%",
    },

    "2/5": {
        width: "40%",
    },

    auto: {
        width: "auto",
    },
};

/**
 * Position + layout system
 */
export const POSITION_STYLES = {
    /**
     * -------------------------------------------------------------------------
     * Top positions
     * -------------------------------------------------------------------------
     */

    "top-right": {
        top: "1rem",
        right: "1rem",
    },

    "top-left": {
        top: "1rem",
        left: "1rem",
    },

    "top-center": {
        top: "1rem",
        left: "50%",
        transform: "translateX(-50%)",
    },

    "top-full": {
        top: "0",
        left: "0",
        right: "0",
    },

    "top-4/5": {
        top: "1rem",
        left: "50%",
        transform: "translateX(-50%)",
        width: "80%",
    },

    "top-3/5": {
        top: "1rem",
        left: "50%",
        transform: "translateX(-50%)",
        width: "60%",
    },

    /**
     * -------------------------------------------------------------------------
     * Bottom positions
     * -------------------------------------------------------------------------
     */

    "bottom-right": {
        bottom: "1rem",
        right: "1rem",
    },

    "bottom-left": {
        bottom: "1rem",
        left: "1rem",
    },

    "bottom-center": {
        bottom: "1rem",
        left: "50%",
        transform: "translateX(-50%)",
    },

    "bottom-full": {
        bottom: "0",
        left: "0",
        right: "0",
    },

    "bottom-4/5": {
        bottom: "1rem",
        left: "50%",
        transform: "translateX(-50%)",
        width: "80%",
    },

    "bottom-3/5": {
        bottom: "1rem",
        left: "50%",
        transform: "translateX(-50%)",
        width: "60%",
    },
};
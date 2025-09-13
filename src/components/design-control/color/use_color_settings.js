// useColorSettings.js
import { useState, useEffect } from "react";
import { defaultColors } from "./default_color";

/**
 * Utility: Normalize a color key to a CSS variable name
 * Example: "navbar-background" -> "--navbar-background-color"
 */
const toCssVar = (key) => `--${key}-color`;

/**
 * Utility: Normalize a key for localStorage
 * Keep it identical to the color key (kebab-case, no suffix)
 */
const toStorageKey = (key) => key;

/**
 * Custom hook to manage global site colors.
 * - Applies colors to CSS variables for live updates
 * - Persists colors to localStorage (using kebab-case keys)
 * - Provides an initializer for restoring persisted colors
 */
export function useColorSettings() {
    // Initialize from localStorage or fall back to defaultColors
    const [colors, setColors] = useState(() => {
        const storedColors = {};
        Object.keys(defaultColors).forEach((key) => {
            storedColors[key] =
                localStorage.getItem(toStorageKey(key)) || defaultColors[key];
        });
        return storedColors;
    });

    /**
     * Apply a set of color values to CSS variables.
     * Example: { "navbar-background": "#123456" }
     * will set document.documentElement.style["--navbar-background-color"]
     */
    const applyColors = (colorValues) => {
        Object.entries(colorValues).forEach(([key, value]) => {
            if (value) {
                document.documentElement.style.setProperty(toCssVar(key), value);
            }
        });
    };

    // Whenever colors state changes, apply them & persist to localStorage
    useEffect(() => {
        applyColors(colors);

        Object.entries(colors).forEach(([key, value]) => {
            localStorage.setItem(toStorageKey(key), value);
        });
    }, [colors]);

    /**
     * Global initializer.
     * Use at app startup (e.g., in App.js) to restore stored colors.
     */
    const initColors = () => {
        const storedColors = {};
        Object.keys(defaultColors).forEach((key) => {
            storedColors[key] =
                localStorage.getItem(toStorageKey(key)) || defaultColors[key];
        });
        applyColors(storedColors);
    };

    return {
        colors,      // Current color values
        setColors,   // Update colors dynamically
        initColors   // Restore/apply colors on app load
    };
}

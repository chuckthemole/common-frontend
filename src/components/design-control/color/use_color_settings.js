// useColorSettings.js
import { useState, useEffect } from "react";
import colorsJson from "../../../constants/colors.json";

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
    // Initialize from localStorage or fall back to colors.json
    const [colors, setColors] = useState(() => {
        const storedColors = {};
        Object.keys(colorsJson).forEach((key) => {
            storedColors[key] =
                localStorage.getItem(toStorageKey(key)) || colorsJson[key];
        });
        return storedColors;
    });

    /**
     * Apply a set of color values to CSS variables.
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
        Object.keys(colorsJson).forEach((key) => {
            storedColors[key] =
                localStorage.getItem(toStorageKey(key)) || colorsJson[key];
        });
        applyColors(storedColors);
    };

    return {
        colors,      // Current color values
        setColors,   // Update colors dynamically
        initColors   // Restore/apply colors on app load
    };
}
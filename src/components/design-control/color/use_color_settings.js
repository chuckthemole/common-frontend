// useColorSettings.js
import { useState, useEffect } from "react";
import colorsJson from "../../../constants/colors.json";
import { predefinedColorLayouts } from "./predefined_color_layouts";
import {
    LocalPersistence,
    MemoryPersistence,
    ApiPersistence
} from "../../../persistence/persistence";

/**
 * Utility: Normalize a color key to a CSS variable name.
 * Example: "navbar-background" -> "--navbar-background-color"
 */
const toCssVar = (key) => `--${key}-color`;

/**
 * Utility: Normalize a key for persistence.
 * Keep it identical to the color key (kebab-case, no suffix).
 */
const toStorageKey = (key) => key;

/**
 * Custom hook to manage global site colors.
 *
 * Responsibilities:
 * - Applies colors to CSS variables for live updates
 * - Persists colors to a configurable persistence layer
 * - Allows an optional predefined layout as the initial default
 * - Provides an initializer for restoring persisted colors
 *
 * @param {Object} persistence - A persistence strategy (LocalPersistence, MemoryPersistence, ApiPersistence(...))
 * @param {string|null} defaultLayout - Optional predefined layout name (e.g. "Ocean Blue").
 *                                      Falls back to colors.json if not provided or invalid.
 */
export function useColorSettings(
    persistence = LocalPersistence,
    defaultLayout = null
) {
    /**
     * Select the baseline defaults:
     * - If a valid `defaultLayout` is provided, use it
     * - Otherwise, fall back to `colors.json`
     */
    const baseDefaults =
        (defaultLayout && predefinedColorLayouts[defaultLayout]) || colorsJson;

    /**
     * Initialize colors:
     * - Attempt to load from persistence
     * - If persistence is empty, fall back to baseline defaults
     * - If persistence is async (API), use defaults for now and refresh later
     */
    const [colors, setColors] = useState(() => {
        const storedColors = {};
        Object.keys(baseDefaults).forEach((key) => {
            const persisted = persistence.getItem(key); // sync if Local/Memory, promise if API
            storedColors[key] =
                persisted instanceof Promise ? baseDefaults[key] : persisted || baseDefaults[key];
        });
        return storedColors;
    });

    /**
     * Apply a set of color values to CSS variables in the <html> root.
     * Ensures all components reflect the current theme immediately.
     */
    const applyColors = (colorValues) => {
        Object.entries(colorValues).forEach(([key, value]) => {
            if (value) {
                document.documentElement.style.setProperty(toCssVar(key), value);
            }
        });
    };

    /**
     * Sync effect:
     * - Runs whenever `colors` state changes
     * - Applies new values to CSS variables
     * - Persists values to chosen storage (local, memory, API)
     */
    useEffect(() => {
        applyColors(colors);

        Object.entries(colors).forEach(([key, value]) => {
            const maybePromise = persistence.setItem(toStorageKey(key), value);
            if (maybePromise instanceof Promise) {
                maybePromise.catch((err) =>
                    console.error(`[useColorSettings] Failed to persist "${key}":`, err)
                );
            }
        });
    }, [colors]);

    /**
     * Global initializer:
     * - Call once at app startup (e.g., in App.js)
     * - Restores persisted colors if available
     * - Falls back to baseline defaults if nothing is stored
     */
    const initColors = async () => {
        const storedColors = {};
        for (const key of Object.keys(baseDefaults)) {
            try {
                const value = await persistence.getItem(toStorageKey(key));
                storedColors[key] = value || baseDefaults[key];
            } catch (err) {
                console.warn(`[useColorSettings] Failed to restore "${key}":`, err);
                storedColors[key] = baseDefaults[key];
            }
        }
        applyColors(storedColors);
        setColors(storedColors);
    };

    return {
        colors,    // Current color values
        setColors, // Update colors dynamically at runtime
        initColors // Restore/apply colors on app load
    };
}

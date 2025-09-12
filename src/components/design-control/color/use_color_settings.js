// useColorSettings.js
import { useState, useEffect } from "react";
import { defaultColors } from "./default_color"; // Import your comprehensive color palette

/**
 * Custom hook to manage global site colors.
 * - Applies colors to CSS variables for live updates
 * - Persists colors to localStorage
 * - Provides a global initializer for App.js or other root components
 */
export function useColorSettings() {
    // Initialize state from localStorage or fallback to defaultColors
    const [colors, setColors] = useState(() => {
        const storedColors = {};
        Object.keys(defaultColors).forEach((key) => {
            storedColors[key] = localStorage.getItem(`${key}Color`) || defaultColors[key];
        });
        return storedColors;
    });

    /**
     * Apply a color object to the document root as CSS variables
     * Example: { primary: "#FF0000" } sets --primary-color in CSS
     * @param {Object} colorValues - key/value pairs of colors
     */
    const applyColors = (colorValues) => {
        Object.entries(colorValues).forEach(([key, value]) => {
            if (value) {
                document.documentElement.style.setProperty(`--${key}-color`, value);
            }
        });
    };

    // Whenever colors state changes, apply them and store in localStorage
    useEffect(() => {
        applyColors(colors);

        Object.entries(colors).forEach(([key, value]) => {
            localStorage.setItem(`${key}Color`, value);
        });
    }, [colors]);

    /**
     * Global initializer function
     * Use in App.js or top-level component to apply stored colors without rendering a modal
     */
    const initColors = () => {
        const storedColors = {};
        Object.keys(defaultColors).forEach((key) => {
            storedColors[key] = localStorage.getItem(`${key}Color`) || defaultColors[key];
        });
        applyColors(storedColors);
    };

    return {
        colors,      // Current color values
        setColors,   // Setter function to update colors dynamically
        initColors   // Function to initialize colors on app load
    };
}

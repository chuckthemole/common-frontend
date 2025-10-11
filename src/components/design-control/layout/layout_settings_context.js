// LayoutSettingsContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { LocalPersistence } from "../../../persistence/persistence";

export const LayoutWidth = Object.freeze({
    FULL: "is-full",
    FOUR_FIFTHS: "is-four-fifths",
    THREE_QUARTERS: "is-three-quarters",
    TWO_THIRDS: "is-two-thirds",
    THREE_FIFTHS: "is-three-fifths",
    HALF: "is-half",
    TWO_FIFTHS: "is-two-fifths",
    ONE_THIRD: "is-one-third",
    ONE_QUARTER: "is-one-quarter",
});

export const layoutOptions = Object.values(LayoutWidth);

const DEFAULT_LAYOUT_SETTINGS = {
    columnWidth: LayoutWidth.THREE_FIFTHS,
};

const LayoutSettingsContext = createContext(null);

/**
 * Provider for global layout settings
 */
export function LayoutSettingsProvider({ children, persistence = LocalPersistence }) {
    const [layout, setLayout] = useState(DEFAULT_LAYOUT_SETTINGS);
    const [initialized, setInitialized] = useState(false);

    // Load saved layout from persistence on mount
    useEffect(() => {
        async function loadLayout() {
            try {
                const stored = await persistence.getItem("columnWidth");
                if (stored && layoutOptions.includes(stored)) {
                    setLayout({ columnWidth: stored });
                }
            } catch (err) {
                console.warn("[LayoutSettings] Failed to load persisted layout:", err);
            } finally {
                setInitialized(true);
            }
        }
        loadLayout();
    }, [persistence]);

    const setLayoutSetting = useCallback(
        (key, value) => {
            if (!layoutOptions.includes(value)) return; // validate
            setLayout((prev) => {
                if (prev[key] === value) return prev;
                const newLayout = { ...prev, [key]: value };
                try {
                    localStorage.setItem("savedLayoutSetting", JSON.stringify({ current: newLayout.columnWidth }));
                    persistence.setItem(key, value);
                } catch (err) {
                    console.error("[LayoutSettings] Failed to persist layout:", err);
                }
                return newLayout;
            });
        },
        [persistence]
    );

    const resetLayout = useCallback(() => {
        setLayout(DEFAULT_LAYOUT_SETTINGS);
        try {
            localStorage.removeItem("savedLayoutSetting");
            persistence.setItem("columnWidth", DEFAULT_LAYOUT_SETTINGS.columnWidth);
        } catch (err) {
            console.error("[LayoutSettings] Failed to reset layout:", err);
        }
    }, [persistence]);

    return (
        <LayoutSettingsContext.Provider value={{ layout, setLayoutSetting, resetLayout, initialized }}>
            {children}
        </LayoutSettingsContext.Provider>
    );
}

/**
 * Hook to access layout settings context
 */
export function useLayoutSettings() {
    const context = useContext(LayoutSettingsContext);
    if (!context) {
        throw new Error("useLayoutSettings must be used within a LayoutSettingsProvider");
    }
    return context;
}

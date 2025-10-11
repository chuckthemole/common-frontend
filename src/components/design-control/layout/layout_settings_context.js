import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";
import { LocalPersistence } from "../../../persistence/persistence";
import { LayoutWidth } from "../../../constants/bulma-layout";

/**
 * Available layout options — derived from LayoutWidth enum
 * (kept dynamic for easy extension)
 */
export const layoutOptions = Object.values(LayoutWidth);

/**
 * Default layout settings
 */
const DEFAULT_LAYOUT_SETTINGS = Object.freeze({
    columnWidth: LayoutWidth.THREE_FIFTHS,
});

/**
 * React Context for managing layout configuration
 * @type {React.Context<{layout: Object, setLayoutSetting: Function, resetLayout: Function, initialized: boolean}>}
 */
const LayoutSettingsContext = createContext(null);

/**
 * Provider for layout settings.
 * 
 * Handles:
 * - Initial load from persistence (localStorage or custom storage)
 * - State synchronization across components
 * - Safe updates with validation and fallbacks
 */
export function LayoutSettingsProvider({ children, persistence = LocalPersistence }) {
    const [layout, setLayout] = useState(DEFAULT_LAYOUT_SETTINGS);
    const [initialized, setInitialized] = useState(false);

    /**
     * Load persisted layout configuration on mount
     */
    useEffect(() => {
        let isMounted = true;

        async function loadLayout() {
            try {
                const stored = await persistence.getItem("columnWidth");

                // Validate stored value
                if (stored && layoutOptions.includes(stored)) {
                    if (isMounted) setLayout({ columnWidth: stored });
                }
            } catch (err) {
                console.warn("[LayoutSettings] Failed to load persisted layout:", err);
            } finally {
                if (isMounted) setInitialized(true);
            }
        }

        loadLayout();
        return () => {
            isMounted = false;
        };
    }, [persistence]);

    /**
     * Update a layout setting (e.g., columnWidth)
     * Persists to both localStorage and provided persistence layer.
     */
    const setLayoutSetting = useCallback(
        (key, value) => {
            // Validate key/value pair
            if (key !== "columnWidth" || !layoutOptions.includes(value)) return;

            setLayout((prev) => {
                if (prev[key] === value) return prev; // no change

                const newLayout = { ...prev, [key]: value };

                try {
                    // Persist synchronously to localStorage for fast reload
                    localStorage.setItem(
                        "savedLayoutSetting",
                        JSON.stringify({ current: newLayout.columnWidth })
                    );

                    // Persist to async storage (e.g., LocalPersistence abstraction)
                    persistence.setItem(key, value);
                } catch (err) {
                    console.error("[LayoutSettings] Failed to persist layout:", err);
                }

                return newLayout;
            });
        },
        [persistence]
    );

    /**
     * Reset layout settings to defaults and clear persistence
     */
    const resetLayout = useCallback(() => {
        setLayout(DEFAULT_LAYOUT_SETTINGS);
        try {
            localStorage.removeItem("savedLayoutSetting");
            persistence.setItem("columnWidth", DEFAULT_LAYOUT_SETTINGS.columnWidth);
        } catch (err) {
            console.error("[LayoutSettings] Failed to reset layout:", err);
        }
    }, [persistence]);

    /**
     * Provider value — memoized API for consumers
     */
    const contextValue = {
        layout,
        setLayoutSetting,
        resetLayout,
        initialized,
    };

    return (
        <LayoutSettingsContext.Provider value={contextValue}>
            {children}
        </LayoutSettingsContext.Provider>
    );
}

/**
 * Custom React Hook to access LayoutSettingsContext.
 * 
 * Ensures the consumer is properly nested within the provider.
 */
export function useLayoutSettings() {
    const context = useContext(LayoutSettingsContext);
    if (!context) {
        throw new Error("useLayoutSettings must be used within a LayoutSettingsProvider");
    }
    return context;
}

import React, { useEffect, useMemo, useState } from "react";
import { ColorSettingsContext } from "./color_settings_context";
import colorsJson from "../../../constants/colors.json";
import { predefinedColorLayouts } from "./predefined_color_layouts";
import logger from "../../../logger";
import {
    LocalPersistence,
    MemoryPersistence,
    ApiPersistence,
} from "../../../persistence/persistence";

/**
 * ColorSettingsProvider
 *
 * Responsibilities:
 * - Resolve the active color slot definitions (resolvedSlots)
 * - Load persisted values safely (sync or async)
 * - Apply CSS variables to a target element
 * - Expose a stable, predictable context API
 *
 * Design principles:
 * - If slots are provided, they are authoritative (no merging with defaults)
 * - If slots are not provided, defaults become implicit slots
 * - Context exposes resolved truth, not raw inputs
 *
 * Props:
 * - target: HTMLElement | ref | () => HTMLElement
 * - persistence: LocalPersistence | MemoryPersistence | ApiPersistence(...)
 * - defaultLayout: string | null
 * - slots?: {
 *     [slotKey]: {
 *       cssVar?: string
 *       default?: string
 *       storageKey?: string
 *     }
 *   }
 */
export default function ColorSettingsProvider({
    target,
    persistence = LocalPersistence,
    defaultLayout = null,
    slots = {},
    colorLayouts = predefinedColorLayouts,
    children,
}) {
    /* --------------------------------------------------
       Resolve DOM target safely
    --------------------------------------------------- */
    const resolveTarget = () => {
        try {
            if (!target) return document.documentElement;
            if (typeof target === "function") return target();
            if (target.current instanceof HTMLElement) return target.current;
            if (target instanceof HTMLElement) return target;

            logger.warn(
                "ColorSettingsProvider: target is not a valid HTMLElement",
                target
            );
        } catch (err) {
            logger.error(
                "ColorSettingsProvider: error resolving target",
                err
            );
        }
        return null;
    };

    /* --------------------------------------------------
       Resolve baseline defaults
       - Used ONLY when slots are not provided
    --------------------------------------------------- */
    const baseDefaults = useMemo(() => {
        if (defaultLayout && colorLayouts[defaultLayout]) {
            return colorLayouts[defaultLayout];
        }
        return colorsJson;
    }, [defaultLayout, colorLayouts]);

    /* --------------------------------------------------
       Resolve canonical slot definitions
       - Single source of truth for slot metadata
       - If slots exist: use them as-is
       - If slots are empty: derive slots from defaults
    --------------------------------------------------- */
    const resolvedSlots = useMemo(() => {
        const hasUserSlots = Object.keys(slots).length > 0;

        // User-defined slots are authoritative
        if (hasUserSlots) {
            return slots;
        }

        // Otherwise, synthesize slots from defaults
        return Object.fromEntries(
            Object.keys(baseDefaults).map((key) => [
                key,
                {
                    cssVar: `--${key}-color`,
                    default: baseDefaults[key],
                },
            ])
        );
    }, [slots, baseDefaults]);

    /* --------------------------------------------------
       Initialize color values
       - Sync persistence: read immediately
       - Async persistence: fall back to defaults
    --------------------------------------------------- */
    const initialValues = useMemo(() => {
        return Object.fromEntries(
            Object.entries(resolvedSlots).map(([key, cfg]) => {
                try {
                    const persisted = cfg.storageKey
                        ? persistence.getItem(cfg.storageKey)
                        : null;

                    const fallback = cfg.default;

                    return [
                        key,
                        persisted instanceof Promise
                            ? fallback
                            : persisted ?? fallback,
                    ];
                } catch (err) {
                    logger.error(
                        `ColorSettingsProvider: error reading initial value for slot "${key}"`,
                        err
                    );
                    return [key, cfg.default];
                }
            })
        );
    }, [resolvedSlots, persistence]);

    const [values, setValues] = useState(initialValues);

    /* --------------------------------------------------
       Apply colors to target + persist updates
    --------------------------------------------------- */
    useEffect(() => {
        const el = resolveTarget();
        if (!el) {
            logger.debug(
                "ColorSettingsProvider: target not ready, skipping apply."
            );
            return;
        }

        Object.entries(resolvedSlots).forEach(([key, cfg]) => {
            const value = values[key];
            if (!value) return;

            try {
                const cssVar = cfg.cssVar || `--${key}-color`;

                if (!cssVar.startsWith("--")) {
                    logger.warn(
                        `ColorSettingsProvider: invalid cssVar "${cssVar}" for slot "${key}". Must start with "--".`
                    );
                    return;
                }

                // Apply CSS variable
                el.style.setProperty(cssVar, value);

                // Persist if configured
                if (cfg.storageKey) {
                    const maybePromise = persistence.setItem(
                        cfg.storageKey,
                        value
                    );
                    if (maybePromise instanceof Promise) {
                        maybePromise.catch((err) =>
                            logger.error(
                                `ColorSettingsProvider: failed to persist "${key}"`,
                                err
                            )
                        );
                    }
                }
            } catch (err) {
                logger.error(
                    `ColorSettingsProvider: failed to apply color for slot "${key}"`,
                    err
                );
            }
        });
    }, [values, resolvedSlots, persistence, target]);

    /* --------------------------------------------------
       Public API
    --------------------------------------------------- */
    const setColor = (slotKey, value) => {
        try {
            setValues((prev) => ({
                ...prev,
                [slotKey]: value,
            }));
        } catch (err) {
            logger.error(
                `ColorSettingsProvider: failed to set color for slot "${slotKey}"`,
                err
            );
        }
    };

    /**
     * Explicit initialization for async persistence (API)
     * - Intended to be called once at app startup
     */
    const initColors = async () => {
        const el = resolveTarget();
        if (!el) return;

        const restored = {};

        for (const [key, cfg] of Object.entries(resolvedSlots)) {
            try {
                const persisted = cfg.storageKey
                    ? await persistence.getItem(cfg.storageKey)
                    : null;

                const value = persisted ?? cfg.default;
                restored[key] = value;

                const cssVar = cfg.cssVar || `--${key}-color`;
                el.style.setProperty(cssVar, value);
            } catch (err) {
                logger.error(
                    `ColorSettingsProvider: failed to initialize color for slot "${key}"`,
                    err
                );
            }
        }

        setValues(restored);
    };

    return (
        <ColorSettingsContext.Provider
            value={{
                values,            // current color values
                setColor,          // update a single slot
                initColors,        // restore/apply persisted colors
                slots: resolvedSlots, // canonical slot definitions
                defaults: baseDefaults,
                layouts: colorLayouts,
            }}
        >
            {children}
        </ColorSettingsContext.Provider>
    );
}

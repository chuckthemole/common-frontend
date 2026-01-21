import React, { useRef, useEffect, useMemo, useState, useCallback } from "react";
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
 * - Resolve canonical color slot definitions
 * - Load persisted values (async-safe)
 * - Apply CSS variables to a target element
 * - Expose a stable, predictable context API
 *
 * Persistence contract:
 * - persistence.getItem(key): Promise<string | null>
 * - persistence.setItem(key, value): Promise<void>
 *
 * This provider NEVER assumes sync storage.
 */
export default function ColorSettingsProvider({
    target,
    persistence = LocalPersistence,
    defaultLayout = null,
    slots = {},
    colorLayouts = predefinedColorLayouts,
    children,
}) {
    const initialSlotsRef = useRef(slots);
    /* --------------------------------------------------
       Resolve DOM target safely
    --------------------------------------------------- */
    const resolveTarget = useCallback(() => {
        try {
            if (!target) return document.documentElement;
            if (typeof target === "function") return target();
            if (target?.current instanceof HTMLElement) return target.current;
            if (target instanceof HTMLElement) return target;
        } catch (err) {
            logger.error("ColorSettingsProvider: error resolving target", err);
        }

        logger.warn(
            "ColorSettingsProvider: target is not a valid HTMLElement",
            target
        );
        return null;
    }, [target]);

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
    --------------------------------------------------- */
    const resolvedSlots = useMemo(() => {
        const slotSource = Object.keys(initialSlotsRef.current).length > 0
            ? initialSlotsRef.current
            : null;

        if (slotSource) {
            return slotSource;
        }

        return Object.fromEntries(
            Object.keys(baseDefaults).map((key) => [
                key,
                {
                    cssVar: `--${key}-color`,
                    default: baseDefaults[key],
                },
            ])
        );
    }, [baseDefaults]);

    /* --------------------------------------------------
       Initial state = defaults only
       (Persistence hydration is async)
    --------------------------------------------------- */
    const [values, setValues] = useState(() =>
        Object.fromEntries(
            Object.entries(resolvedSlots).map(([key, cfg]) => [
                key,
                cfg.default,
            ])
        )
    );

    /* --------------------------------------------------
       Hydrate persisted colors (async-safe)
    --------------------------------------------------- */
    useEffect(() => {
        let cancelled = false;

        const hydrate = async () => {
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
                        `ColorSettingsProvider: failed to hydrate slot "${key}"`,
                        err
                    );
                }
            }

            if (!cancelled) {
                setValues(restored);
            }
        };

        hydrate();

        return () => {
            cancelled = true;
        };
    }, [resolvedSlots, persistence, resolveTarget]);

    /* --------------------------------------------------
       Apply updates + persist changes
    --------------------------------------------------- */
    useEffect(() => {
        const el = resolveTarget();
        if (!el) return;

        Object.entries(resolvedSlots).forEach(([key, cfg]) => {
            const value = values[key];
            if (!value) return;

            try {
                const cssVar = cfg.cssVar || `--${key}-color`;
                el.style.setProperty(cssVar, value);

                if (cfg.storageKey) {
                    persistence
                        .setItem(cfg.storageKey, value)
                        .catch((err) =>
                            logger.error(
                                `ColorSettingsProvider: failed to persist "${key}"`,
                                err
                            )
                        );
                }
            } catch (err) {
                logger.error(
                    `ColorSettingsProvider: failed to apply color for slot "${key}"`,
                    err
                );
            }
        });
    }, [values, resolvedSlots, persistence, resolveTarget]);

    /* --------------------------------------------------
       Public API
    --------------------------------------------------- */
    const setColor = useCallback((slotKey, value) => {
        setValues((prev) => ({
            ...prev,
            [slotKey]: value,
        }));
    }, []);

    /**
     * Explicit re-initialization hook
     * Useful for API-backed persistence after auth
     */
    const initColors = useCallback(async () => {
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
                    `ColorSettingsProvider: init failed for slot "${key}"`,
                    err
                );
            }
        }

        setValues(restored);
    }, [resolvedSlots, persistence, resolveTarget]);

    return (
        <ColorSettingsContext.Provider
            value={{
                values,
                setColor,
                initColors,
                slots: resolvedSlots,
                defaults: baseDefaults,
                layouts: colorLayouts,
            }}
        >
            {children}
        </ColorSettingsContext.Provider>
    );
}

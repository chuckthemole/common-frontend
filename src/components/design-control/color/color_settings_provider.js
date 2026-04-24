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
import { toKebabCase } from "../../../utils";
import { COLOR_TOKENS } from "../../../constants/color-tokens";

/**
 * Maps a given input object of color values to the standardized COLOR_TOKENS structure.
 *
 * For each token key, returns an object containing:
 * - cssVar: the CSS custom property name used for styling
 * - default: the corresponding value from the input object
 * - storageKey: a namespaced key used for persistence (e.g., localStorage)
 *
 * This ensures all color slots follow a consistent shape for applying styles
 * and saving user-specific preferences.
 */
export function mapToColorSlots(input, options = {}) {
    const {
        storageKeyBase = "personal-page",
        user = "default",
    } = options;

    const result = Object.fromEntries(
        Object.entries(COLOR_TOKENS).map(([key, config]) => [
            key,
            {
                cssVar: config.cssVar,
                default: input[key],
                storageKey: `${storageKeyBase}:${key}:${user}:${key}`, // TODO: why are we appending key at end, twice?
            },
        ])
    );

    logger.debug("mapToColorSlots result:", result);

    return result;
}

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
    defaultLayout = null, // look in predefinedColorLayouts for defaultLayout keys
    profileId,
    slots = {},
    colorLayouts = predefinedColorLayouts,
    onChange,
    children,
}) {
    const BASE_STORAGE_KEY = "COLOR";
    const initialSlotsRef = useRef(slots);
    const didHydrateRef = useRef(false);
    const didInitRef = useRef(false);

    /* --------------------------------------------------
       Resolve DOM target safely
    --------------------------------------------------- */
    const resolveTarget = useCallback(() => {
        try {
            logger.debug("[ColorSettingsProvider]: resolving target", target);

            if (!target) {
                logger.debug("[ColorSettingsProvider]: no target provided, defaulting to null.");
                return null;
            }

            if (typeof target === "function") {
                const result = target();
                logger.debug("[ColorSettingsProvider]: target is a function, returned", result);
                return result;
            }

            if (target?.current instanceof HTMLElement) {
                logger.debug("[ColorSettingsProvider]: target is a ref, returning current HTMLElement", target.current);
                return target.current;
            }

            if (target instanceof HTMLElement) {
                logger.debug("[ColorSettingsProvider]: target is an HTMLElement", target);
                return target;
            }

        } catch (err) {
            logger.error("[ColorSettingsProvider]: error resolving target", err);
        }

        logger.warn("[ColorSettingsProvider]: target is not a valid HTMLElement", target);
        return null;
    }, [target]);

    /* --------------------------------------------------
       Resolve baseline defaults
       - Used ONLY when slots are not provided
    --------------------------------------------------- */
    const baseDefaults = useMemo(() => {
        let defaults;
        if (defaultLayout && colorLayouts[defaultLayout]) {
            defaults = colorLayouts[defaultLayout];
            logger.debug("[ColorSettingsProvider] Using defaultLayout from colorLayouts:", defaultLayout, defaults);
        } else {
            defaults = colorsJson;
            logger.debug("[ColorSettingsProvider] Using colorsJson as baseDefaults:", defaults);
        }
        return defaults;
    }, [defaultLayout, colorLayouts]);

    function buildStorageKey(profileId, baseKey, slotKey) {
        if (!profileId) return null; // disables persistence for drafts
        return `${baseKey}:${profileId}:${slotKey}`;
    }

    /* --------------------------------------------------
       Resolve canonical slot definitions
       - Single source of truth for slot metadata
    --------------------------------------------------- */
    const resolvedSlots = useMemo(() => {
        let resolved;

        const hasInitialSlots = Object.keys(initialSlotsRef.current).length > 0;
        logger.debug("[ColorSettingsProvider] initialSlotsRef.current:", initialSlotsRef.current, "hasInitialSlots:", hasInitialSlots);

        if (hasInitialSlots) {
            resolved = initialSlotsRef.current;
            logger.debug("[ColorSettingsProvider] Using initialSlotsRef as resolvedSlots:", resolved);
        } else {
            resolved = Object.fromEntries(
                Object.keys(baseDefaults).map((key) => [
                    key,
                    {
                        cssVar: `--${key}-color`,
                        default: baseDefaults[key],
                        // storageKey: `color_${profileId}:${key}`, // assign storageKey for persistence
                        // storageKey: `${buildStorageKey(profileId, key.storageKey, key)}`,
                    },
                ])
            );
            logger.debug("[ColorSettingsProvider] Created resolvedSlots from baseDefaults:", resolved);
        }

        const normalized = {};

        for (const [slotKey, cfg] of Object.entries(resolved)) {
            const baseKey = cfg.storageKey || BASE_STORAGE_KEY;

            normalized[slotKey] = {
                ...cfg,
                storageKey: buildStorageKey(profileId, baseKey, slotKey),
            };
        }

        logger.debug("[ColorSettingsProvider] Resolved & normalized slots:", normalized);
        return normalized;

        // }, [JSON.stringify(baseDefaults)]); // stable dependency to avoid unnecessary re-runs
    }, [baseDefaults, profileId]);

    /* --------------------------------------------------
       Initial state = defaults only
       (Persistence hydration is async)
    --------------------------------------------------- */
    const [values, setValues] = useState(() =>
        Object.fromEntries(Object.entries(resolvedSlots).map(([key, cfg]) => [key, cfg.default]))
    );

    /* --------------------------------------------------
       Hydrate persisted colors (async-safe)
       - Ensures CSS variables and React state sync
       - Minimizes effect cancellations due to async
    --------------------------------------------------- */
    useEffect(() => {
        const resolvedTargetElement = resolveTarget();
        if (!resolvedTargetElement) {
            logger.warn("[ColorSettingsProvider] useEffect 1: Target element not found, waiting...");
            return;
        }

        let cancelled = false;

        const hydrate = async () => {
            const restored = {};

            for (const [key, cfg] of Object.entries(resolvedSlots)) {
                try {
                    if (!cfg.storageKey) {
                        logger.warn(`[ColorSettingsProvider] Slot "${key}" has no storageKey, persistence skipped`);
                    }

                    logger.debug(`[Hydrate] Starting key "${key}"`);

                    const persisted = cfg.storageKey ? await persistence.getItem(cfg.storageKey) : null;
                    const value = persisted ?? cfg.default;
                    restored[key] = value;

                    const cssVarName = cfg.cssVar || `--${key}-color`;
                    resolvedTargetElement.style.setProperty(cssVarName, value);

                    logger.debug(`[ColorSettingsProvider] Hydrated slot "${key}": ${cssVarName} = ${value}`);
                } catch (err) {
                    logger.error(`[ColorSettingsProvider] Failed to hydrate slot "${key}"`, err);
                }
            }

            if (!cancelled) {
                setValues(restored);
                didHydrateRef.current = true;
                logger.debug("[ColorSettingsProvider] Hydration complete, restored values:", restored);

                // Notify parent after hydration
                onChange?.(restored);
            } else {
                logger.warn("[ColorSettingsProvider] Hydration cancelled, state not updated");
            }
        };

        hydrate();

        return () => {
            cancelled = true;
            logger.debug("[ColorSettingsProvider] Cleanup: hydration cancelled");
        };
    }, [resolvedSlots, persistence, resolveTarget]);

    /* --------------------------------------------------
       Apply updates + persist changes
    --------------------------------------------------- */
    useEffect(() => {
        const resolvedTargetElement = resolveTarget();
        if (!resolvedTargetElement) {
            logger.warn("[ColorSettingsProvider] useEffect 2: Target element not found, waiting...");
            logger.debug("[ColorSettingsProvider] Skipping effect: no target element resolved");
            return;
        }

        // SKIP persisting on first hydration
        if (!didHydrateRef.current) {
            logger.debug("[ColorSettingsProvider] Skipping effect: initial hydration not complete");
            return;
        }

        Object.entries(resolvedSlots).forEach(([key, cfg]) => {
            const value = values[key];

            if (!value) {
                logger.debug(`[ColorSettingsProvider] Skipping slot "${key}": no value found`);
                return;
            }

            try {
                const cssVar = cfg.cssVar || `--${key}-color`;
                logger.debug(`[ColorSettingsProvider] Applying slot "${key}"`, {
                    cssVar,
                    value,
                    storageKey: cfg.storageKey,
                });

                // Sets a CSS custom property (variable) on the target element.
                // Example:
                //   If cssVar = "--primary-color" and value = "#ff0000",
                //   this sets: --primary-color: #ff0000;
                //
                // This will only visually change anything if your CSS is using the variable, e.g.:
                //   .button {
                //     background-color: var(--primary-color);
                //   }
                //
                // Note: CSS variables are scoped. If this is set on a specific element,
                // only that element and its children can use it. For global usage,
                // set it on document.documentElement instead.
                resolvedTargetElement.style.setProperty(cssVar, value);

                if (cfg.storageKey) {
                    logger.debug(`[ColorSettingsProvider] Persisting slot "${key}"`, {
                        storageKey: cfg.storageKey,
                        value,
                    });

                    // now we only persist changes after hydration
                    persistence
                        .setItem(cfg.storageKey, value)
                        .then(() => {
                            logger.debug(`[ColorSettingsProvider] Successfully persisted "${key}"`, {
                                storageKey: cfg.storageKey,
                                value,
                            });
                        })
                        .catch((err) =>
                            logger.error(`ColorSettingsProvider: failed to persist "${key}"`, err)
                        );
                } else {
                    logger.warn(`[ColorSettingsProvider] Slot "${key}" has no storageKey, persistence skipped`);
                    logger.debug(`[ColorSettingsProvider] Skipped persistence for slot "${key}" due to missing storageKey`);
                }
            } catch (err) {
                logger.error(`ColorSettingsProvider: failed to apply color for slot "${key}"`, err);
            }
        });
    }, [values, resolvedSlots, persistence, resolveTarget]);

    /* --------------------------------------------------
       Public API
    --------------------------------------------------- */
    const setColor = useCallback((slotKey, value) => {
        setValues((prev) => {
            const next = { ...prev, [slotKey]: value };
            onChange?.(next); // notify parent
            return next;
        });
    }, [onChange]);

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
                const persisted = cfg.storageKey ? await persistence.getItem(cfg.storageKey) : null;
                const value = persisted ?? cfg.default;
                restored[key] = value;

                const cssVar = cfg.cssVar || `--${key}-color`;
                el.style.setProperty(cssVar, value);
            } catch (err) {
                logger.error(`ColorSettingsProvider: init failed for slot "${key}"`, err);
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

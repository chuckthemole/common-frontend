import React, {
    useEffect,
    useMemo,
    useState,
    useCallback,
    useRef,
} from "react";
import { FontSettingsContext } from "./font_settings_context";
import {
    google_fonts,
    system_fonts,
    custom_fonts,
} from "../../../constants/fonts";
import logger from "../../../logger";
import {
    LocalPersistence,
    MemoryPersistence,
    ApiPersistence,
} from "../../../persistence/persistence";

/**
 * FontSettingsProvider
 *
 * Responsibilities:
 * - Resolve canonical font slot definitions
 * - Hydrate persisted values asynchronously
 * - Apply CSS variables to a target element
 * - Load font stylesheets when required
 * - Support controlled + uncontrolled usage
 *
 * Persistence contract:
 * - persistence.getItem(key): Promise<string | null>
 * - persistence.setItem(key, value): Promise<void>
 *
 * No persistence reads occur during render.
 */
export default function FontSettingsProvider({
    target,
    persistence = LocalPersistence,
    slots = {},
    value,
    onChange,
    children,
}) {
    /* --------------------------------------------------
       Lifecycle guards
    --------------------------------------------------- */
    const didHydrateRef = useRef(false);
    const didInitRef = useRef(false);

    /* --------------------------------------------------
       Font source toggles
    --------------------------------------------------- */
    const [enabledSources, setEnabledSources] = useState({
        google: true,
        system: true,
        custom: true,
    });

    /* --------------------------------------------------
       Resolve DOM target safely
    --------------------------------------------------- */
    const resolveTarget = () => {
        try {
            if (!target) return null;

            // Function returning element
            if (typeof target === "function") return target();

            // Ref object
            if (target?.current instanceof HTMLElement) return target.current;

            // HTMLElement directly
            if (target instanceof HTMLElement) return target;

            // Selector string
            if (typeof target === "string") {
                return document.querySelector(target);
            }
        } catch (err) {
            logger.error("FontSettingsProvider: error resolving target", err);
        }

        logger.warn(
            "FontSettingsProvider: target is not a valid HTMLElement",
            target
        );
        return null;
    };

    /* --------------------------------------------------
       Canonical slot definitions
    --------------------------------------------------- */
    const resolvedSlots = useMemo(() => slots, [slots]);

    /* --------------------------------------------------
       Initial state = defaults only
       (Persistence hydration is async)
    --------------------------------------------------- */
    const [internalValues, setInternalValues] = useState(() =>
        Object.fromEntries(
            Object.entries(resolvedSlots).map(([key, cfg]) => [
                key,
                cfg.default,
            ])
        )
    );

    /* --------------------------------------------------
       Controlled vs uncontrolled
    --------------------------------------------------- */
    const values = value ?? internalValues;

    /* --------------------------------------------------
       Available fonts by enabled source
    --------------------------------------------------- */
    const fonts = useMemo(() => {
        let list = [];
        if (enabledSources.google) list = list.concat(google_fonts);
        if (enabledSources.system) list = list.concat(system_fonts);
        if (enabledSources.custom) list = list.concat(custom_fonts);
        return list;
    }, [enabledSources]);

    /* --------------------------------------------------
       Ensure font stylesheet is loaded
    --------------------------------------------------- */
    const ensureFontLoaded = useCallback(
        (fontValue) => {
            try {
                const font = fonts.find((f) => f.value === fontValue);
                if (!font?.url) return;

                const id = `font-${font.name}`;
                if (document.getElementById(id)) return;

                const link = document.createElement("link");
                link.id = id;
                link.rel = "stylesheet";
                link.href = font.url;
                document.head.appendChild(link);

                logger.info(
                    `FontSettingsProvider: loaded font "${font.name}"`
                );
            } catch (err) {
                logger.error(
                    `FontSettingsProvider: failed to load font "${fontValue}"`,
                    err
                );
            }
        },
        [fonts]
    );

    /* --------------------------------------------------
       Hydrate persisted fonts (async-safe)
    --------------------------------------------------- */
    useEffect(() => {
        if (didHydrateRef.current) return;

        const el = resolveTarget();
        if (!el) return;

        didHydrateRef.current = true;
        let cancelled = false;

        const hydrate = async () => {
            const restored = {};

            for (const [key, cfg] of Object.entries(resolvedSlots)) {
                try {
                    const persisted = cfg.storageKey
                        ? await persistence.getItem(cfg.storageKey)
                        : null;

                    const fontValue = persisted ?? cfg.default;
                    restored[key] = fontValue;

                    if (cfg.cssVar?.startsWith("--")) {
                        el.style.setProperty(cfg.cssVar, fontValue);
                    }

                    ensureFontLoaded(fontValue);
                } catch (err) {
                    logger.error(
                        `FontSettingsProvider: failed to hydrate slot "${key}"`,
                        err
                    );
                }
            }

            if (cancelled) return;

            if (!value) {
                setInternalValues(restored);
            }

            // Notify parent exactly once after hydration
            onChange?.(restored);
        };

        hydrate();

        return () => {
            cancelled = true;
        };
    }, [resolvedSlots, persistence, target, ensureFontLoaded]);

    /* --------------------------------------------------
       Apply updates + persist changes
    --------------------------------------------------- */
    useEffect(() => {
        const el = resolveTarget();
        if (!el) return;

        // Skip first run (hydration phase)
        if (!didInitRef.current) {
            didInitRef.current = true;
            return;
        }

        Object.entries(resolvedSlots).forEach(([key, cfg]) => {
            const fontValue = values[key];
            if (!fontValue) return;

            try {
                if (!cfg.cssVar?.startsWith("--")) {
                    logger.warn(
                        `FontSettingsProvider: invalid cssVar "${cfg.cssVar}" for slot "${key}"`
                    );
                    return;
                }

                el.style.setProperty(cfg.cssVar, fontValue);
                ensureFontLoaded(fontValue);

                if (cfg.storageKey) {
                    persistence
                        .setItem(cfg.storageKey, fontValue)
                        .catch((err) =>
                            logger.error(
                                `FontSettingsProvider: failed to persist "${key}"`,
                                err
                            )
                        );
                }
            } catch (err) {
                logger.error(
                    `FontSettingsProvider: failed to apply font for slot "${key}"`,
                    err
                );
            }
        });
    }, [values, resolvedSlots, persistence, ensureFontLoaded, target]);

    /* --------------------------------------------------
       Public API
    --------------------------------------------------- */
    const setFont = useCallback(
        (slotKey, fontValue) => {
            const next = { ...values, [slotKey]: fontValue };

            if (!value) {
                setInternalValues(next);
            }

            onChange?.(next);
        },
        [values, value, onChange]
    );

    const toggleSource = useCallback((source) => {
        setEnabledSources((prev) => ({
            ...prev,
            [source]: !prev[source],
        }));
    }, []);

    /**
     * Explicit re-initialization hook
     * Useful for API-backed persistence after auth
     */
    const initFonts = async () => {
        const el = resolveTarget();
        if (!el) return;

        const restored = {};

        for (const [key, cfg] of Object.entries(resolvedSlots)) {
            try {
                const persisted = cfg.storageKey
                    ? await persistence.getItem(cfg.storageKey)
                    : null;

                const fontValue = persisted ?? cfg.default;
                restored[key] = fontValue;

                if (cfg.cssVar?.startsWith("--")) {
                    el.style.setProperty(cfg.cssVar, fontValue);
                }

                ensureFontLoaded(fontValue);
            } catch (err) {
                logger.error(
                    `FontSettingsProvider: init failed for slot "${key}"`,
                    err
                );
            }
        }

        if (!value) {
            setInternalValues(restored);
        }

        onChange?.(restored);
    };

    return (
        <FontSettingsContext.Provider
            value={{
                fonts,
                values,
                setFont,
                enabledSources,
                toggleSource,
                initFonts,
                slots: resolvedSlots,
            }}
        >
            {children}
        </FontSettingsContext.Provider>
    );
}

import React, { useEffect, useMemo, useState } from "react";
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
 * - Resolve the active font slot definitions
 * - Load persisted values safely (sync or async)
 * - Apply CSS variables to a target element
 * - Load font stylesheets if needed
 * - Expose a stable, predictable context API
 *
 * Props:
 * - target: HTMLElement | ref | () => HTMLElement
 * - persistence: LocalPersistence | MemoryPersistence | ApiPersistence(...)
 * - slots: {
 *     slotKey: {
 *       cssVar: string,
 *       default: string,
 *       storageKey?: string
 *     }
 *   }
 */
export default function FontSettingsProvider({
    target,
    persistence = LocalPersistence,
    slots = {},
    children,
}) {
    /* ----------------------------
       Font source toggles
    ----------------------------- */
    const [enabledSources, setEnabledSources] = useState({
        google: true,
        system: true,
        custom: true,
    });

    /* ----------------------------
       Resolve DOM target safely
    ----------------------------- */
    const resolveTarget = () => {
        try {
            if (!target) return null;
            if (typeof target === "function") return target();
            if (target.current instanceof HTMLElement) return target.current;
            if (target instanceof HTMLElement) return target;

            logger.warn(
                "FontSettingsProvider: target is not a valid HTMLElement",
                target
            );
        } catch (err) {
            logger.error("FontSettingsProvider: error resolving target", err);
        }
        return null;
    };

    /* ----------------------------
       Resolve canonical slot definitions
       - Single source of truth for slot metadata
    ----------------------------- */
    const resolvedSlots = useMemo(() => {
        return slots;
    }, [slots]);

    /* ----------------------------
       Initialize font values
       - Sync persistence: read immediately
       - Async persistence: fallback to defaults
    ----------------------------- */
    const initialValues = useMemo(() => {
        return Object.fromEntries(
            Object.entries(resolvedSlots).map(([key, cfg]) => {
                try {
                    const persisted = cfg.storageKey
                        ? persistence.getItem(cfg.storageKey)
                        : null;
                    return [
                        key,
                        persisted instanceof Promise ? cfg.default : persisted ?? cfg.default,
                    ];
                } catch (err) {
                    logger.error(
                        `FontSettingsProvider: error reading initial value for slot "${key}"`,
                        err
                    );
                    return [key, cfg.default];
                }
            })
        );
    }, [resolvedSlots, persistence]);

    const [values, setValues] = useState(initialValues);

    /* ----------------------------
       Available fonts
    ----------------------------- */
    const fonts = useMemo(() => {
        let f = [];
        if (enabledSources.google) f = f.concat(google_fonts);
        if (enabledSources.system) f = f.concat(system_fonts);
        if (enabledSources.custom) f = f.concat(custom_fonts);
        return f;
    }, [enabledSources]);

    /* ----------------------------
       Load font stylesheet if needed
    ----------------------------- */
    const ensureFontLoaded = (fontValue) => {
        try {
            const fontObj = fonts.find((f) => f.value === fontValue);
            if (!fontObj?.url) return;

            const id = `font-${fontObj.name}`;
            if (!document.getElementById(id)) {
                const link = document.createElement("link");
                link.id = id;
                link.rel = "stylesheet";
                link.href = fontObj.url;
                document.head.appendChild(link);
                logger.info(`FontSettingsProvider: loaded font "${fontObj.name}" from URL`);
            }
        } catch (err) {
            logger.error(`FontSettingsProvider: failed to load font "${fontValue}"`, err);
        }
    };

    /* ----------------------------
       Apply fonts to target + persist updates
    ----------------------------- */
    useEffect(() => {
        const el = resolveTarget();
        if (!el) {
            logger.debug(
                "FontSettingsProvider: target not ready, will retry on next render."
            );
            return;
        }

        Object.entries(resolvedSlots).forEach(([key, cfg]) => {
            const value = values[key];
            if (!value) return;

            try {
                if (!cfg.cssVar.startsWith("--")) {
                    logger.warn(
                        `FontSettingsProvider: invalid cssVar "${cfg.cssVar}" for slot "${key}". Must start with "--".`
                    );
                    return;
                }

                el.style.setProperty(cfg.cssVar, value);
                ensureFontLoaded(value);

                if (cfg.storageKey) {
                    const maybePromise = persistence.setItem(cfg.storageKey, value);
                    if (maybePromise instanceof Promise) {
                        maybePromise.catch((err) =>
                            logger.error(`FontSettingsProvider: failed to persist "${key}"`, err)
                        );
                    }
                }
            } catch (err) {
                logger.error(
                    `FontSettingsProvider: failed to apply font for slot "${key}"`,
                    err
                );
            }
        });
    }, [values, resolvedSlots, persistence, fonts, target]);

    /* ----------------------------
       Public API
    ----------------------------- */
    const setFont = (slotKey, value) => {
        try {
            setValues((prev) => ({ ...prev, [slotKey]: value }));
        } catch (err) {
            logger.error(`FontSettingsProvider: failed to set font for slot "${slotKey}"`, err);
        }
    };

    const toggleSource = (source) => {
        try {
            setEnabledSources((prev) => ({
                ...prev,
                [source]: !prev[source],
            }));
        } catch (err) {
            logger.error(`FontSettingsProvider: failed to toggle font source "${source}"`, err);
        }
    };

    /**
     * Explicit initialization for async persistence
     * - Intended to be called once at app startup
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
                const value = persisted ?? cfg.default;
                restored[key] = value;

                if (cfg.cssVar.startsWith("--")) {
                    el.style.setProperty(cfg.cssVar, value);
                }
                ensureFontLoaded(value);
            } catch (err) {
                logger.error(
                    `FontSettingsProvider: failed to initialize font for slot "${key}"`,
                    err
                );
            }
        }

        setValues(restored);
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

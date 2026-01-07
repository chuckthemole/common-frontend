    import React, { useEffect, useMemo, useState } from "react";
    import { FontSettingsContext } from "./font_settings_context";
    import {
        google_fonts,
        system_fonts,
        custom_fonts,
    } from "../../../constants/fonts";
    import logger from "../../../logger";

    /**
     * FontSettingsProvider
     *
     * Props:
     * - target: HTMLElement | ref | () => HTMLElement
     * - persist: boolean
     * - slots: {
     *     slotKey: {
     *        cssVar: string,
     *        default: string,
     *        storageKey?: string
     *     }
     *   }
     */
    export default function FontSettingsProvider({
        target,
        persist = false,
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

                // warn only if it exists but isn’t valid
                logger.warn("FontSettingsProvider: target is not a valid HTMLElement", target);
            } catch (err) {
                logger.error("FontSettingsProvider: error resolving target", err);
            }
            return null;
        };


        /* ----------------------------
        Initialize font values
        ----------------------------- */
        const initialValues = Object.fromEntries(
            Object.entries(slots).map(([key, cfg]) => {
                try {
                    const stored = persist && cfg.storageKey ? localStorage.getItem(cfg.storageKey) : null;
                    return [key, stored || cfg.default];
                } catch (err) {
                    logger.error(`FontSettingsProvider: error reading initial value for slot "${key}"`, err);
                    return [key, cfg.default];
                }
            })
        );

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
        Apply fonts to target safely
        ----------------------------- */
        useEffect(() => {
            const el = resolveTarget();

            if (!el) {
                // Target not yet attached, skip this render
                logger.debug("FontSettingsProvider: target not ready, will retry on next render.");
                return;
            }

            Object.entries(slots).forEach(([key, cfg]) => {
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

                    if (persist && cfg.storageKey) {
                        localStorage.setItem(cfg.storageKey, value);
                    }
                } catch (err) {
                    logger.error(
                        `FontSettingsProvider: failed to apply font for slot "${key}"`,
                        err
                    );
                }
            });
        }, [values, slots, persist, fonts, target]);


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

        const initFonts = () => {
            const el = resolveTarget();
            if (!el) return;

            Object.entries(slots).forEach(([key, cfg]) => {
                try {
                    const stored = persist && cfg.storageKey ? localStorage.getItem(cfg.storageKey) : null;
                    const value = stored || cfg.default;
                    if (cfg.cssVar.startsWith("--")) {
                        el.style.setProperty(cfg.cssVar, value);
                    }
                } catch (err) {
                    logger.error(`FontSettingsProvider: failed to initialize font for slot "${key}"`, err);
                }
            });
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
                    slots,
                }}
            >
                {children}
            </FontSettingsContext.Provider>
        );
    }

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
 * Props:
 * - target: HTMLElement | ref | () => HTMLElement
 * - persistence: LocalPersistence | MemoryPersistence | ApiPersistence(...)
 * - defaultLayout: string | null
 * - slots: {
 *     slotKey: {
 *        cssVar: string,
 *        default: string,
 *        storageKey?: string
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
    /* ----------------------------
       Resolve DOM target safely
    ----------------------------- */
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

    /* ----------------------------
       Resolve baseline defaults
    ----------------------------- */
    const baseDefaults = useMemo(() => {
        if (defaultLayout && colorLayouts[defaultLayout]) {
            return colorLayouts[defaultLayout];
        }
        return colorsJson;
    }, [defaultLayout]);

    /* ----------------------------
       Initialize color values
       - Sync persistence: read immediately
       - Async persistence: fall back to defaults
    ----------------------------- */
    const initialValues = useMemo(() => {
        // Use slots if provided, otherwise fall back to all keys in baseDefaults
        const keys = Object.keys(slots).length ? Object.keys(slots) : Object.keys(baseDefaults);

        return Object.fromEntries(
            keys.map((key) => {
                const cfg = slots[key] || {};
                try {
                    const persisted = cfg.storageKey ? persistence.getItem(cfg.storageKey) : null;
                    const fallback = cfg.default ?? baseDefaults[key];
                    return [
                        key,
                        persisted instanceof Promise ? fallback : persisted || fallback,
                    ];
                } catch (err) {
                    logger.error(
                        `ColorSettingsProvider: error reading initial value for slot "${key}"`,
                        err
                    );
                    return [key, cfg.default ?? baseDefaults[key]];
                }
            })
        );
    }, [slots, persistence, baseDefaults]);

    const [values, setValues] = useState(initialValues);

    /* ----------------------------
       Apply colors to target
       + Persist updates
    ----------------------------- */
    useEffect(() => {
        const el = resolveTarget();
        if (!el) {
            logger.debug("ColorSettingsProvider: target not ready, skipping apply.");
            return;
        }

        const keys = Object.keys(slots).length ? Object.keys(slots) : Object.keys(values);

        keys.forEach((key) => {
            const cfg = slots[key] || {};
            const value = values[key];
            if (!value) return;

            try {
                // Use the cssVar from slot, or fallback to `--key-color`
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
                    const maybePromise = persistence.setItem(cfg.storageKey, value);
                    if (maybePromise instanceof Promise) {
                        maybePromise.catch((err) =>
                            logger.error(`ColorSettingsProvider: failed to persist "${key}"`, err)
                        );
                    }
                }
            } catch (err) {
                logger.error(`ColorSettingsProvider: failed to apply color for slot "${key}"`, err);
            }
        });
    }, [values, slots, persistence, target]);

    /* ----------------------------
       Public API
    ----------------------------- */
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
     * Initialize colors explicitly:
     * - Safe for async persistence (API)
     * - Intended to be called once at app startup
     */
    const initColors = async () => {
        const el = resolveTarget();
        if (!el) return;

        const restored = {};

        const keys = Object.keys(slots).length ? Object.keys(slots) : Object.keys(baseDefaults);

        for (const key of keys) {
            const cfg = slots[key] || {};
            try {
                const persisted = cfg.storageKey ? await persistence.getItem(cfg.storageKey) : null;
                const value = persisted ?? cfg.default ?? baseDefaults[key];
                restored[key] = value;

                const cssVar = cfg.cssVar || `--${key}-color`;
                el.style.setProperty(cssVar, value);
            } catch (err) {
                logger.error(`ColorSettingsProvider: failed to initialize color for slot "${key}"`, err);
            }
        }

        setValues(restored);
    };

    return (
        <ColorSettingsContext.Provider
            value={{
                values,      // current color values
                setColor,    // update a single color slot
                initColors,  // restore/apply persisted colors
                slots,       // slot metadata
                defaults: baseDefaults, // durrent layout defaults
                layouts: colorLayouts
            }}
        >
            {children}
        </ColorSettingsContext.Provider>
    );
}

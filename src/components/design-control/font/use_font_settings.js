// import { useState, useEffect, useMemo } from "react";
// import {
//     google_fonts,
//     system_fonts,
//     custom_fonts
// } from "../../../constants/fonts";
// import logger from "../../../logger";

// /**
//  * Generic font settings hook.
//  *
//  * Responsibilities:
//  * - Manage font slots (user-defined)
//  * - Apply fonts to a target element via CSS variables
//  * - Optionally persist to localStorage
//  * - Load remote font stylesheets when needed
//  */
// export function useFontSettings({
//     slots = {},
//     target = document.documentElement,
//     persist = true,
// } = {}) {
//     /* ---------------- Font Sources ---------------- */

//     const [enabledSources, setEnabledSources] = useState({
//         google: true,
//         system: true,
//         custom: true,
//     });

//     const fonts = useMemo(() => {
//         let f = [];
//         if (enabledSources.google) f = f.concat(google_fonts);
//         if (enabledSources.system) f = f.concat(system_fonts);
//         if (enabledSources.custom) f = f.concat(custom_fonts);
//         return f;
//     }, [enabledSources]);

//     /* ---------------- Slot State ---------------- */

//     const [values, setValues] = useState(() => {
//         const initial = {};
//         Object.entries(slots).forEach(([key, slot]) => {
//             if (persist && slot.storageKey) {
//                 initial[key] =
//                     localStorage.getItem(slot.storageKey) ?? slot.default;
//             } else {
//                 initial[key] = slot.default;
//             }
//         });
//         return initial;
//     });

//     /* ---------------- Apply Font ---------------- */

//     const applyFont = (slotKey, fontValue) => {
//         const slot = slots[slotKey];
//         if (!slot || !target) return;

//         logger.debug(`Applying font [${slotKey}]: ${fontValue}`);

//         target.style.setProperty(slot.cssVar, fontValue);

//         if (persist && slot.storageKey) {
//             localStorage.setItem(slot.storageKey, fontValue);
//         }

//         const fontObj = fonts.find((f) => f.value === fontValue);
//         if (fontObj?.url) {
//             const linkId = `font-${fontObj.name}`;
//             if (!document.getElementById(linkId)) {
//                 const link = document.createElement("link");
//                 link.id = linkId;
//                 link.rel = "stylesheet";
//                 link.href = fontObj.url;
//                 document.head.appendChild(link);
//             }
//         }
//     };

//     /* ---------------- React to Changes ---------------- */

//     useEffect(() => {
//         Object.entries(values).forEach(([slotKey, value]) => {
//             applyFont(slotKey, value);
//         });
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [values, fonts, target]);

//     /* ---------------- Public API ---------------- */

//     const setFont = (slotKey, value) => {
//         setValues((prev) => ({
//             ...prev,
//             [slotKey]: value,
//         }));
//     };

//     const toggleSource = (source) => {
//         setEnabledSources((prev) => ({
//             ...prev,
//             [source]: !prev[source],
//         }));
//     };

//     const initFonts = () => {
//         Object.entries(slots).forEach(([key, slot]) => {
//             if (!persist || !slot.storageKey) return;
//             const stored = localStorage.getItem(slot.storageKey);
//             if (stored) applyFont(key, stored);
//         });
//     };

//     return {
//         fonts,
//         values,        // { primary, secondary, body, heading, ... }
//         setFont,       // setFont("primary", "Inter")
//         enabledSources,
//         toggleSource,
//         initFonts,
//     };
// }

import { useContext } from "react";
import { FontSettingsContext } from "./font_settings_context";

export function useFontSettings() {
    const context = useContext(FontSettingsContext);

    if (!context) {
        throw new Error(
            "useFontSettings must be used within a FontSettingsProvider"
        );
    }

    return context;
}

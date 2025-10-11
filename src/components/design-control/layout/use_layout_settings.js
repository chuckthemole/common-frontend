// // useLayoutSettings.js
// import { useState, useEffect } from "react";
// import {
//     LocalPersistence,
//     MemoryPersistence,
//     ApiPersistence,
// } from "../../../persistence/persistence";

// /**
//  * Keys that can be persisted for layout.
//  * Currently: column width, but we’ll extend this later.
//  */
// const DEFAULT_LAYOUT_SETTINGS = {
//     columnWidth: "is-three-fifths",
// };

// /**
//  * Custom hook to manage global layout settings.
//  *
//  * Responsibilities:
//  * - Persists layout settings (column width, layout type, etc.)
//  * - Provides runtime control and live updates
//  * - Can use local, memory, or API-based persistence
//  */
// export function useLayoutSettings(
//     persistence = LocalPersistence
// ) {
//     // Load from persistence synchronously where possible
//     const [layout, setLayout] = useState(() => {
//         const storedLayout = {};
//         Object.keys(DEFAULT_LAYOUT_SETTINGS).forEach((key) => {
//             const persisted = persistence.getItem(key);
//             storedLayout[key] =
//                 persisted instanceof Promise
//                     ? DEFAULT_LAYOUT_SETTINGS[key]
//                     : persisted || DEFAULT_LAYOUT_SETTINGS[key];
//         });
//         return storedLayout;
//     });

//     // Apply side effects (if needed) when layout changes
//     // For now, no DOM side effects are needed (unlike colors)
//     useEffect(() => {
//         Object.entries(layout).forEach(([key, value]) => {
//             const maybePromise = persistence.setItem(key, value);
//             if (maybePromise instanceof Promise) {
//                 maybePromise.catch((err) =>
//                     console.error(`[useLayoutSettings] Failed to persist "${key}":`, err)
//                 );
//             }
//         });
//     }, [layout]);

//     /**
//      * Restore layout settings (async-safe, e.g., API persistence).
//      */
//     const initLayout = async () => {
//         const storedLayout = {};
//         for (const key of Object.keys(DEFAULT_LAYOUT_SETTINGS)) {
//             try {
//                 const value = await persistence.getItem(key);
//                 storedLayout[key] = value || DEFAULT_LAYOUT_SETTINGS[key];
//             } catch (err) {
//                 console.warn(`[useLayoutSettings] Failed to restore "${key}":`, err);
//                 storedLayout[key] = DEFAULT_LAYOUT_SETTINGS[key];
//             }
//         }
//         setLayout(storedLayout);
//     };

//     /**
//      * Helper to update layout values easily.
//      * Example: setLayoutSetting("columnWidth", "is-full")
//      */
//     const setLayoutSetting = (key, value) => {
//         setLayout((prev) => ({ ...prev, [key]: value }));
//     };

//     return {
//         layout,             // current layout object
//         setLayout,          // set entire layout object
//         setLayoutSetting,   // set individual setting
//         initLayout,         // restore settings on startup
//     };
// }


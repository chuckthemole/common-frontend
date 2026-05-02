import React from "react";
import {
    FontSettingsProvider,
    ColorSettingsProvider,
    FontSettingsModal,
    ColorSettingsModal
} from "../../../design-control";
import { SingleSelector, SectionCard } from "../../../dashboard-elements";
import { previewColorLayouts } from "../../../design-control/color/predefined_color_layouts_preview";
import { THEMES } from "../personal-page.schema";
import logger from "../../../../logger";

/* ============================================================
   Page Style Controls
   ============================================================ */
function PageStyleControls({
    page,
    setPage,
}) {
    return (
        <SectionCard title="Page Style" enabled={true} onChange={() => { }}>
            <div className="page-style-controls">
                <div className="theme-selector">
                    <SingleSelector
                        options={THEMES}
                        value={page.theme}
                        onChange={(value) => setPage((p) => ({ ...p, theme: value }))}
                        searchable={false}
                        ui={'scrollable'}
                        visibleRows={2}
                    />
                </div>
                <div className="buttons-grid">
                    <FontSettingsModal
                        preview
                        buttonLabel="Fonts"
                    />
                    <ColorSettingsModal
                        buttonLabel="Color"
                    />
                </div>
            </div>
        </SectionCard>
    );
}

export default function PageStylePanel({
    previewEl,
    page,
    setPage,
    fontSettings,
    setFontSettings,
    colorSettings,
    setColorSettings,
    profileId,
}) {
    if (!previewEl) {
        logger.debug("[PageStylePanel] No previewEl, returning null.");
        return null;
    }

    return (
        <FontSettingsProvider
            target={previewEl}
            value={fontSettings}
            onChange={setFontSettings}
            slots={{
                body: {
                    cssVar: "--page-font",
                    default: "Inter",
                    storageKey: "personal-page:page-font",
                },
                heading: {
                    cssVar: "--heading-font",
                    default: "Playfair Display",
                    storageKey: "personal-page:heading-font",
                },
            }}
        >
            <ColorSettingsProvider
                target={previewEl}
                value={colorSettings}
                onChange={setColorSettings}
                colorLayouts={previewColorLayouts}
                profileId={profileId}
                slots={{
                    /* ======================================================
                       Page-level colors (global background & text)
                       ====================================================== */

                    "background": {
                        cssVar: "--page-background",
                        default: "#ffffff", // main page background
                        storageKey: "personal-page:background",
                    },
                    "text": {
                        cssVar: "--page-text",
                        default: "#333333", // primary body text
                        storageKey: "personal-page:text",
                    },
                    "muted-text": {
                        cssVar: "--page-text-muted",
                        default: "#666666", // subtitles, helper text
                        storageKey: "personal-page:muted-text",
                    },

                    /* ======================================================
                       Surface & elevation layers
                       (cards, modals, inset panels)
                       ====================================================== */

                    "surface": {
                        cssVar: "--surface-background",
                        default: "#f8f9fb", // raised surfaces on light themes
                        storageKey: "personal-page:surface",
                    },
                    "surface-text": {
                        cssVar: "--surface-text",
                        default: "#333333",
                        storageKey: "personal-page:surface-text",
                    },
                    "card-background": {
                        cssVar: "--card-background",
                        default: "#ffffff",
                        storageKey: "personal-page:card-background",
                    },
                    "card-border": {
                        cssVar: "--card-border",
                        default: "#e5e7eb", // subtle card outline
                        storageKey: "personal-page:card-border",
                    },

                    /* ======================================================
                       Navigation
                       ====================================================== */

                    "nav-background": {
                        cssVar: "--nav-background",
                        default: "#1a1a1a",
                        storageKey: "personal-page:nav-background",
                    },
                    "nav-text": {
                        cssVar: "--nav-text",
                        default: "#ffffff",
                        storageKey: "personal-page:nav-text",
                    },
                    "nav-hover": {
                        cssVar: "--nav-hover",
                        default: "#f5f5f5",
                        storageKey: "personal-page:nav-hover",
                    },
                    "nav-border": {
                        cssVar: "--nav-border",
                        default: "rgba(255,255,255,0.1)",
                        storageKey: "personal-page:nav-border",
                    },

                    /* ======================================================
                       Buttons
                       ====================================================== */

                    "button-background": {
                        cssVar: "--button-background",
                        default: "#3273dc",
                        storageKey: "personal-page:button-background",
                    },
                    "button-text": {
                        cssVar: "--button-text",
                        default: "#ffffff",
                        storageKey: "personal-page:button-text",
                    },
                    "button-hover": {
                        cssVar: "--button-hover",
                        default: "#2759a3",
                        storageKey: "personal-page:button-hover",
                    },
                    "button-border": {
                        cssVar: "--button-border",
                        default: "transparent",
                        storageKey: "personal-page:button-border",
                    },

                    /* ======================================================
                       Links & accents
                       ====================================================== */

                    "accent": {
                        cssVar: "--accent-color",
                        default: "#ff3860",
                        storageKey: "personal-page:accent",
                    },
                    "link": {
                        cssVar: "--link-color",
                        default: "#3273dc",
                        storageKey: "personal-page:link",
                    },
                    "link-hover": {
                        cssVar: "--link-hover",
                        default: "#2759a3",
                        storageKey: "personal-page:link-hover",
                    },

                    /* ======================================================
                       Dividers & outlines
                       ====================================================== */

                    "border": {
                        cssVar: "--border-color",
                        default: "#e5e7eb",
                        storageKey: "personal-page:border",
                    },
                    "focus-ring": {
                        cssVar: "--focus-ring",
                        default: "#3273dc",
                        storageKey: "personal-page:focus-ring",
                    },
                }}
            >
                <PageStyleControls
                    page={page}
                    setPage={setPage}
                />
            </ColorSettingsProvider>
        </FontSettingsProvider>
    );
}

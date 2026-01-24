import React from "react";
import {
    FontSettingsProvider,
    ColorSettingsProvider,
    FontSettingsModal,
    ColorSettingsModal
} from "../../../design-control";
import { SingleSelector } from "../../../dashboard-elements";
import { previewColorLayouts } from "../../../design-control/color/predefined_color_layouts_preview";
import { SectionCard } from "./sections-helper";
import { THEMES } from "../personal-page.schema";

/* ============================================================
   Page Style Controls
   ============================================================ */
function PageStyleControls({
    previewRef,
    page,
    setPage,
    colorSettings,
    setColorSettings
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
}) {
    if (!previewEl) return null;

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
                slots={{
                    /* ======================================================
                       Page-level colors (global background & text)
                       ====================================================== */

                    background: {
                        cssVar: "--page-background",
                        default: "#ffffff", // main page background
                        storageKey: "personal-page:background",
                    },
                    text: {
                        cssVar: "--page-text",
                        default: "#333333", // primary body text
                        storageKey: "personal-page:text",
                    },
                    mutedText: {
                        cssVar: "--page-text-muted",
                        default: "#666666", // subtitles, helper text
                        storageKey: "personal-page:mutedText",
                    },

                    /* ======================================================
                       Surface & elevation layers
                       (cards, modals, inset panels)
                       ====================================================== */

                    surface: {
                        cssVar: "--surface-background",
                        default: "#f8f9fb", // raised surfaces on light themes
                        storageKey: "personal-page:surface",
                    },
                    surfaceText: {
                        cssVar: "--surface-text",
                        default: "#333333",
                        storageKey: "personal-page:surfaceText",
                    },
                    cardBackground: {
                        cssVar: "--card-background",
                        default: "#ffffff",
                        storageKey: "personal-page:cardBackground",
                    },
                    cardBorder: {
                        cssVar: "--card-border",
                        default: "#e5e7eb", // subtle card outline
                        storageKey: "personal-page:cardBorder",
                    },

                    /* ======================================================
                       Navigation
                       ====================================================== */

                    navBackground: {
                        cssVar: "--nav-background",
                        default: "#1a1a1a",
                        storageKey: "personal-page:navBackground",
                    },
                    navText: {
                        cssVar: "--nav-text",
                        default: "#ffffff",
                        storageKey: "personal-page:navText",
                    },
                    navHover: {
                        cssVar: "--nav-hover",
                        default: "#f5f5f5",
                        storageKey: "personal-page:navHover",
                    },
                    navBorder: {
                        cssVar: "--nav-border",
                        default: "rgba(255,255,255,0.1)",
                        storageKey: "personal-page:navBorder",
                    },

                    /* ======================================================
                       Buttons
                       ====================================================== */

                    buttonBackground: {
                        cssVar: "--button-background",
                        default: "#3273dc",
                        storageKey: "personal-page:buttonBackground",
                    },
                    buttonText: {
                        cssVar: "--button-text",
                        default: "#ffffff",
                        storageKey: "personal-page:buttonText",
                    },
                    buttonHover: {
                        cssVar: "--button-hover",
                        default: "#2759a3",
                        storageKey: "personal-page:buttonHover",
                    },
                    buttonBorder: {
                        cssVar: "--button-border",
                        default: "transparent",
                        storageKey: "personal-page:buttonBorder",
                    },

                    /* ======================================================
                       Links & accents
                       ====================================================== */

                    accent: {
                        cssVar: "--accent-color",
                        default: "#ff3860",
                        storageKey: "personal-page:accent",
                    },
                    link: {
                        cssVar: "--link-color",
                        default: "#3273dc",
                        storageKey: "personal-page:link",
                    },
                    linkHover: {
                        cssVar: "--link-hover",
                        default: "#2759a3",
                        storageKey: "personal-page:linkHover",
                    },

                    /* ======================================================
                       Dividers & outlines
                       ====================================================== */

                    border: {
                        cssVar: "--border-color",
                        default: "#e5e7eb",
                        storageKey: "personal-page:border",
                    },
                    focusRing: {
                        cssVar: "--focus-ring",
                        default: "#3273dc",
                        storageKey: "personal-page:focusRing",
                    },
                }}
            >
                <PageStyleControls
                    previewRef={previewEl}
                    page={page}
                    setPage={setPage}
                    colorSettings={colorSettings}
                    setColorSettings={setColorSettings}
                />
            </ColorSettingsProvider>
        </FontSettingsProvider>
    );
}

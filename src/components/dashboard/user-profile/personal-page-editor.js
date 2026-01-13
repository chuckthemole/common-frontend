import React, { useEffect, useState, useRef } from "react";
import RumpusQuill from "../../ui/editors/rumpus_quill";
import RumpusQuillForm from "../../ui/editors/rumpus_quill_form";
import SingleSelector from "../../dashboard-elements/single-selector/single-selector";
import ToggleSwitch from "../../dashboard-elements/toggle-switch/toggle-switch";
import Tooltip from "../../ui/tooltip/tooltip";
import PagePreview from "./page-preview";
import Alert from "../../ui/alerts/alert";
import FontSettingsModal from "../../design-control/font/font_settings_modal";
import ColorSettingsModal from "../../design-control/color/color_settings_modal";
import { FontSettingsProvider } from "../../design-control/font";
import { ColorSettingsProvider } from "../../design-control/color";
import { previewColorLayouts } from "../../design-control/color/predefined_color_layouts_preview";

import logger from "../../../logger";
import { LocalPersistence } from "../../../persistence/persistence";

/* ============================================================
   Constants
   ============================================================ */

/**
 * Persistence key for this editor.
 * Change this once if you want multiple drafts / profiles.
 */
const PAGE_STORAGE_KEY = "personal-page:draft";

/* ============================================================
   Default Page Schema
   ============================================================ */
const DEFAULT_PAGE = {
    theme: "modern",
    sections: [
        {
            id: "home",
            type: "home",
            enabled: true,
            showTitle: false,
            defaultTitle: "Home",
            title: "Home",
            data: { name: "", tagline: "", profileImage: "" },
        },
        {
            id: "about",
            type: "about",
            enabled: true,
            showTitle: true,
            defaultTitle: "About",
            title: "About",
            data: { content: "" },
        },
        {
            id: "projects",
            type: "projects",
            enabled: true,
            showTitle: true,
            defaultTitle: "Projects",
            title: "Projects",
            data: {
                items: [],
                layout: "carousel",
                itemsPerPage: 3,
            },
        },
        {
            id: "contact",
            type: "contact",
            enabled: true,
            showTitle: true,
            defaultTitle: "Contact",
            title: "Contact",
            data: { email: "" },
        },
    ],
};

// Available themes
const THEMES = [
    { value: "modern", label: "Modern (default)" },
    { value: "minimal", label: "Minimal" },
    { value: "portfolio", label: "Portfolio Focused" },
];

/* ============================================================
   Page Style Controls (Theme + Font + Color)
   ============================================================ */
function PageStyleControls(
    {
        previewRef,
        page,
        setPage,
        colorSettings,
        setColorSettings
    }
) {

    return (
        <SectionCard title="Page Style" enabled={true} onChange={() => { }}>
            <div className="page-style-controls">
                {/* Theme selector */}
                <div className="theme-selector">
                    <SingleSelector
                        options={THEMES}
                        value={page.theme}
                        onChange={(value) => setPage((p) => ({ ...p, theme: value }))}
                        searchable={false}
                    />
                </div>

                {/* Font & Color Modals */}
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

/* ---------- EditableTitle Component ---------- */
function EditableTitle({ value, defaultValue, onChange }) {
    const [editing, setEditing] = useState(false);
    const [localValue, setLocalValue] = useState(value);

    const handleSave = () => {
        onChange(localValue.trim() || defaultValue);
        setEditing(false);
    };

    return (
        <div className="editable-title is-flex is-align-items-center">
            {!editing ? (
                <>

                    <span className="mr-2">{value || defaultValue}</span>
                    <Tooltip text="Edit title">
                        <button
                            type="button"
                            className="button is-small is-light"
                            onClick={() => setEditing(true)}
                            title="Edit title"
                        >   ✎
                        </button>
                    </Tooltip>
                </>
            ) : (
                <>
                    <input
                        className="input is-small mr-2"
                        style={{ width: "150px" }}
                        value={localValue}
                        onChange={(e) => setLocalValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSave();
                            if (e.key === "Escape") setEditing(false);
                        }}
                        autoFocus
                    />
                    <button type="button" className="button is-small is-primary mr-1" onClick={handleSave}>
                        Save
                    </button>
                    <button type="button" className="button is-small" onClick={() => setEditing(false)}>
                        Cancel
                    </button>
                </>
            )}
        </div>
    );
}

/* ============================================================
   Personal Page Editor
   ============================================================ */

export default function PersonalPageEditor({ onSuccess, persistence: persistenceProp }) {
    const persistence = persistenceProp || LocalPersistence;
    const previewRef = useRef(null);
    const aboutRef = useRef(null);

    const [page, setPage] = useState(DEFAULT_PAGE);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [colorSettings, setColorSettings] = useState({});

    /* ========================================================
       Load persisted page on mount
       ======================================================== */

    useEffect(() => {
        try {
            const stored = persistence.getItem(PAGE_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setPage(parsed);
            }
        } catch (err) {
            logger.error("[PersonalPageEditor] Failed to load draft:", err);
        }
    }, [persistence]);

    /* ========================================================
       Helpers
       ======================================================== */

    const sectionById = (id) => page.sections.find((s) => s.id === id);

    const updateSection = (id, updater) =>
        setPage((prev) => ({
            ...prev,
            sections: prev.sections.map((s) =>
                s.id === id ? { ...s, data: { ...s.data, ...updater } } : s
            ),
        }));

    const toggleSection = (id, enabled) =>
        setPage((prev) => ({
            ...prev,
            sections: prev.sections.map((s) =>
                s.id === id ? { ...s, enabled } : s
            ),
        }));

    const toggleSectionTitle = (id, showTitle) =>
        setPage((prev) => ({
            ...prev,
            sections: prev.sections.map((s) =>
                s.id === id ? { ...s, showTitle } : s
            ),
        }));

    const ToggleSectionTitleHelper = ({ sectionId, showTitle }) => (
        <Tooltip text="Show or hide this section’s title in the preview">
            <div className="is-flex is-flex-direction-column is-align-items-center ml-3">
                {/* <span className="mb-1 is-size-7 has-text-grey">Show title</span> */}
                <ToggleSwitch
                    checked={showTitle}
                    color="is-info"
                    onChange={(v) => toggleSectionTitle(sectionId, v)}
                />
            </div>
        </Tooltip>
    );

    const updateSectionTitle = (id, title) =>
        setPage((prev) => ({
            ...prev,
            sections: prev.sections.map((s) =>
                s.id === id ? { ...s, title } : s
            ),
        }));

    /* ========================================================
       Project helpers (unchanged behavior)
       ======================================================== */

    const updateProjects = (items) =>
        updateSection("projects", { items });

    const moveProject = (index, dir) => {
        const items = [...sectionById("projects").data.items];
        const target = index + dir;
        if (target < 0 || target >= items.length) return;
        [items[index], items[target]] = [items[target], items[index]];
        updateProjects(items);
    };

    const removeProject = (index) =>
        updateProjects(
            sectionById("projects").data.items.filter((_, i) => i !== index)
        );

    /* ========================================================
       Save
       ======================================================== */

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            persistence.setItem(
                PAGE_STORAGE_KEY,
                JSON.stringify(page)
            );

            setSuccessMessage("Page saved successfully!");
            onSuccess?.(page);
        } catch (err) {
            logger.error("[PersonalPageEditor] Save failed:", err);
            setError("Failed to save changes.");
        } finally {
            setLoading(false);
        }
    };

    /* ========================================================
       Render
       ======================================================== */

    const home = sectionById("home");
    const about = sectionById("about");
    const projects = sectionById("projects");
    const contact = sectionById("contact");

    return (
        <RumpusQuillForm>
            {/* Header */}
            <div className="editor-header global-editor-header box">
                <h2 className="title is-4 mb-0">Personal Page Editor</h2>

                <div className="is-flex is-align-items-center">
                    <div className="is-flex is-flex-direction-column is-align-items-center">
                        <span className="label has-text-grey">Preview</span>
                        <ToggleSwitch
                            checked={previewVisible}
                            onChange={setPreviewVisible}
                        />
                    </div>

                    <button
                        className="button is-link ml-4"
                        disabled={loading}
                        onClick={handleSubmit}
                    >
                        {loading ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>

            {/* ---------- Main Layout ---------- */}
            <div className="columns is-variable is-6">
                {/* ---------- Editor Column ---------- */}
                <div className={`column ${previewVisible ? "is-6" : "is-12"} editor-column`}>
                    <div className="editor-scroll">
                        {/* Page Style Controls */}
                        <FontSettingsProvider
                            target={previewRef}
                            persist={false}
                            slots={{
                                body: {
                                    cssVar: "--page-font",
                                    default: "Inter"
                                },
                                heading: {
                                    cssVar: "--heading-font",
                                    default: "Playfair Display"
                                },
                            }}
                        >
                            <ColorSettingsProvider
                                target={previewRef}
                                colorLayouts={previewColorLayouts}
                                slots={{
                                    /* ======================================================
                                       Page-level colors (global background & text)
                                       ====================================================== */

                                    background: {
                                        cssVar: "--page-background",
                                        default: "#ffffff", // main page background
                                    },
                                    text: {
                                        cssVar: "--page-text",
                                        default: "#333333", // primary body text
                                    },
                                    mutedText: {
                                        cssVar: "--page-text-muted",
                                        default: "#666666", // subtitles, helper text
                                    },

                                    /* ======================================================
                                       Surface & elevation layers
                                       (cards, modals, inset panels)
                                       ====================================================== */

                                    surface: {
                                        cssVar: "--surface-background",
                                        default: "#f8f9fb", // raised surfaces on light themes
                                    },
                                    surfaceText: {
                                        cssVar: "--surface-text",
                                        default: "#333333",
                                    },
                                    cardBackground: {
                                        cssVar: "--card-background",
                                        default: "#ffffff",
                                    },
                                    cardBorder: {
                                        cssVar: "--card-border",
                                        default: "#e5e7eb", // subtle card outline
                                    },

                                    /* ======================================================
                                       Navigation
                                       ====================================================== */

                                    navBackground: {
                                        cssVar: "--nav-background",
                                        default: "#1a1a1a",
                                    },
                                    navText: {
                                        cssVar: "--nav-text",
                                        default: "#ffffff",
                                    },
                                    navHover: {
                                        cssVar: "--nav-hover",
                                        default: "#f5f5f5",
                                    },
                                    navBorder: {
                                        cssVar: "--nav-border",
                                        default: "rgba(255,255,255,0.1)",
                                    },

                                    /* ======================================================
                                       Buttons
                                       ====================================================== */

                                    buttonBackground: {
                                        cssVar: "--button-background",
                                        default: "#3273dc",
                                    },
                                    buttonText: {
                                        cssVar: "--button-text",
                                        default: "#ffffff",
                                    },
                                    buttonHover: {
                                        cssVar: "--button-hover",
                                        default: "#2759a3",
                                    },
                                    buttonBorder: {
                                        cssVar: "--button-border",
                                        default: "transparent",
                                    },

                                    /* ======================================================
                                       Links & accents
                                       ====================================================== */

                                    accent: {
                                        cssVar: "--accent-color",
                                        default: "#ff3860",
                                    },
                                    link: {
                                        cssVar: "--link-color",
                                        default: "#3273dc",
                                    },
                                    linkHover: {
                                        cssVar: "--link-hover",
                                        default: "#2759a3",
                                    },

                                    /* ======================================================
                                       Dividers & outlines
                                       ====================================================== */

                                    border: {
                                        cssVar: "--border-color",
                                        default: "#e5e7eb",
                                    },
                                    focusRing: {
                                        cssVar: "--focus-ring",
                                        default: "#3273dc",
                                    },
                                }}
                            >
                                <PageStyleControls
                                    previewRef={previewRef}
                                    page={page}
                                    setPage={setPage}
                                    colorSettings={colorSettings}
                                    setColorSettings={setColorSettings}
                                />
                            </ColorSettingsProvider>
                        </FontSettingsProvider>

                        {/* ---------- Home Section ---------- */}
                        <SectionCard
                            title={
                                <EditableTitle
                                    value={home.title}
                                    defaultValue={home.defaultTitle}
                                    onChange={(val) => updateSectionTitle("home", val)}
                                />
                            }
                            headerExtra={
                                <ToggleSectionTitleHelper
                                    sectionId="home"
                                    showTitle={home.showTitle}
                                />
                            }
                            enabled={home.enabled}
                            onChange={(v) => toggleSection("home", v)}
                        >
                            <input
                                className="input mb-2"
                                placeholder="Name"
                                onChange={(e) => updateSection("home", { name: e.target.value })}
                            />
                            <input
                                className="input mb-2"
                                placeholder="Tagline"
                                onChange={(e) => updateSection("home", { tagline: e.target.value })}
                            />
                            <input
                                className="input"
                                placeholder="Profile Image URL"
                                onChange={(e) => updateSection("home", { profileImage: e.target.value })}
                            />
                        </SectionCard>

                        {/* ---------- About Section ---------- */}
                        <SectionCard
                            title={

                                <EditableTitle
                                    value={about.title}
                                    defaultValue={about.defaultTitle}
                                    onChange={(val) => updateSectionTitle("about", val)}
                                />
                            }
                            headerExtra={
                                <ToggleSectionTitleHelper
                                    sectionId="about"
                                    showTitle={about.showTitle}
                                />
                            }
                            enabled={about.enabled}
                            onChange={(v) => toggleSection("about", v)}
                        >
                            <RumpusQuill
                                value={about.data.content}
                                editor_ref={aboutRef}
                                setValue={(val) => updateSection("about", { content: val })}
                                placeholder="Write your bio..."
                            />
                        </SectionCard>

                        {/* ---------- Projects Section ---------- */}
                        <SectionCard
                            title={
                                <EditableTitle
                                    value={projects.title}
                                    defaultValue={projects.defaultTitle}
                                    onChange={(val) => updateSectionTitle("projects", val)}
                                />
                            }
                            headerExtra={
                                <ToggleSectionTitleHelper
                                    sectionId="projects"
                                    showTitle={projects.showTitle}
                                />
                            }
                            enabled={projects.enabled}
                            onChange={(v) => toggleSection("projects", v)}
                        >
                            <button
                                type="button"
                                className="button is-small mb-3"
                                onClick={() => updateProjects([...projects.data.items, { title: "", link: "" }])}
                            >
                                + Add Project
                            </button>
                            {projects.data.items.map((p, i) => (
                                <div key={i} className="box mb-3">
                                    <input
                                        className="input mb-2"
                                        placeholder="Project title"
                                        value={p.title}
                                        onChange={(e) => {
                                            const items = [...projects.data.items];
                                            items[i].title = e.target.value;
                                            updateProjects(items);
                                        }}
                                    />
                                    <input
                                        className="input mb-3"
                                        placeholder="Project link"
                                        value={p.link}
                                        onChange={(e) => {
                                            const items = [...projects.data.items];
                                            items[i].link = e.target.value;
                                            updateProjects(items);
                                        }}
                                    />
                                    <div className="buttons">
                                        <button type="button" className="button is-small" onClick={() => moveProject(i, -1)}>
                                            ↑
                                        </button>
                                        <button type="button" className="button is-small" onClick={() => moveProject(i, 1)}>
                                            ↓
                                        </button>
                                        <button type="button" className="button is-small is-danger" onClick={() => removeProject(i)}>
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </SectionCard>

                        {/* ---------- Contact Section ---------- */}
                        <SectionCard
                            title={
                                <EditableTitle
                                    value={contact.title}
                                    defaultValue={contact.defaultTitle}
                                    onChange={(val) => updateSectionTitle("contact", val)}
                                />
                            }
                            headerExtra={
                                <ToggleSectionTitleHelper
                                    sectionId="contact"
                                    showTitle={contact.showTitle}
                                />
                            }
                            enabled={contact.enabled}
                            onChange={(v) => toggleSection("contact", v)}
                        >
                            <input
                                className="input"
                                placeholder="Email"
                                type="email"
                                onChange={(e) => updateSection("contact", { email: e.target.value })}
                            />
                        </SectionCard>

                        {/* ---------- Error Alert ---------- */}
                        {error && (
                            <Alert
                                message={error}
                                type="error"
                                persistent={false}
                                size="medium"
                                position="bottom"
                                onClose={() => setError(null)}
                            />
                        )}

                        {/* ---------- Success Alert ---------- */}
                        {successMessage && (
                            <Alert
                                message={successMessage}
                                type="success"
                                persistent={false}
                                size="medium"
                                position="bottom"
                                onClose={() => setSuccessMessage(null)}
                            />
                        )}

                    </div>
                </div>

                {/* ---------- Preview Column ---------- */}
                {previewVisible && (
                    <div className="column is-6" ref={previewRef}>
                        <div
                            className="page-preview-frame"
                        >
                            <PagePreview page={page} />
                        </div>
                    </div>
                )}
            </div>
        </RumpusQuillForm>
    );
}

/* ---------- Helpers ---------- */
const SectionCard = ({ title, enabled, onChange, headerExtra, children }) => (
    <div className="box mb-5">
        <div className="is-flex is-justify-content-space-between is-align-items-center mb-3">
            <div className="is-flex is-align-items-center gap-2">
                <h3 className="title is-5 mb-0">{title}</h3>
                {headerExtra}
            </div>
            <Tooltip text="Enable/disable section">
                <ToggleSwitch checked={enabled} onChange={onChange} />
            </Tooltip>
        </div>
        {enabled && children}
    </div>
);


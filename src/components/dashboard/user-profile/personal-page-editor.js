import React, { useEffect, useState, useRef } from "react";
import RumpusQuill from "../../ui/editors/rumpus_quill";
import PortalContainer from "../../ui/portal-container";
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
            data: { items: [], layout: "carousel", itemsPerPage: 3 },
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
   Page Style Controls
   ============================================================ */
function PageStyleControls({ previewRef, page, setPage, colorSettings, setColorSettings }) {
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
                    <FontSettingsModal preview buttonLabel="Fonts" />
                    <ColorSettingsModal buttonLabel="Color" />
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
                        >
                            ✎
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
   PersonalPageEditor
   ============================================================ */
export default function PersonalPageEditor({
    onSuccess,
    persistence: persistenceProp
}) {
    const persistence = persistenceProp || LocalPersistence;
    // const previewRef = useRef(null);
    const [previewEl, setPreviewEl] = useState(null);
    const aboutRef = useRef(null);

    const [page, setPage] = useState(DEFAULT_PAGE);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [colorSettings, setColorSettings] = useState({});
    const [fontSettings, setFontSettings] = useState({});
    const [profileId, setProfileId] = useState("");
    const [savedProfiles, setSavedProfiles] = useState({});

    // DEBUG
    // useEffect(() => {
    //     logger.debug("[PersonalPageEditor] render", {
    //         previewVisible,
    //         hasPreviewEl: !!previewEl,
    //     });
    // });

    /* ========================================================
   Load all saved profiles on mount
   ======================================================== */
    useEffect(() => {
        let cancelled = false;

        const loadProfiles = async () => {
            try {
                const storedProfiles = await persistence.getItem("personal-page:profiles");
                if (!storedProfiles || cancelled) return;

                setSavedProfiles(JSON.parse(storedProfiles));
            } catch (err) {
                logger.error("[PersonalPageEditor] Failed to load profiles:", err);
            }
        };

        loadProfiles();

        return () => {
            cancelled = true;
        };
    }, [persistence]);

    /* ========================================================
       Load a draft page on mount
       ======================================================== */
    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const stored = await persistence.getItem(PAGE_STORAGE_KEY);
                if (!stored || cancelled) return;

                const parsed = JSON.parse(stored);
                setPage(parsed);
                setFontSettings(parsed.fontSettings || { body: "Inter", heading: "Playfair Display" });
                setColorSettings(parsed.colorSettings || {});
            } catch (err) {
                logger.error("[PersonalPageEditor] Failed to load draft:", err);
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, [persistence]);

    /* ========================================================
       Helpers
       ======================================================== */
    const sectionById = (id) => {
        try {
            if (!page?.sections || !Array.isArray(page.sections)) {
                logger.warn("sectionById: page.sections is not available or not an array", {
                    page,
                });
                return undefined;
            }

            return page.sections.find((s) => s?.id === id);
        } catch (err) {
            logger.error("sectionById: failed to resolve section", {
                id,
                page,
                error: err,
            });
            return undefined;
        }
    };

    const getSectionSafe = (id) => {
        const section = sectionById(id);

        if (!section) {
            logger.warn("Missing section, falling back to defaults", { id });

            return DEFAULT_PAGE.sections.find((s) => s.id === id) ?? {
                id,
                enabled: false,
                showTitle: false,
                title: "",
                defaultTitle: "",
                data: {},
            };
        }

        return section;
    };

    const updateSection = (id, updater) =>
        setPage((prev) => ({
            ...prev,
            sections: prev.sections.map((s) => (s.id === id ? { ...s, data: { ...s.data, ...updater } } : s)),
        }));

    const toggleSection = (id, enabled) =>
        setPage((prev) => ({
            ...prev,
            sections: prev.sections.map((s) => (s.id === id ? { ...s, enabled } : s)),
        }));

    const toggleSectionTitle = (id, showTitle) =>
        setPage((prev) => ({
            ...prev,
            sections: prev.sections.map((s) => (s.id === id ? { ...s, showTitle } : s)),
        }));

    const ToggleSectionTitleHelper = ({ sectionId, showTitle }) => (
        <Tooltip text="Show or hide this section’s title in the preview">
            <div className="is-flex is-flex-direction-column is-align-items-center ml-3">
                <ToggleSwitch checked={showTitle} color="is-info" onChange={(v) => toggleSectionTitle(sectionId, v)} />
            </div>
        </Tooltip>
    );

    const updateSectionTitle = (id, title) =>
        setPage((prev) => ({
            ...prev,
            sections: prev.sections.map((s) => (s.id === id ? { ...s, title } : s)),
        }));

    /* ========================================================
       Project helpers
       ======================================================== */
    const updateProjects = (items) => updateSection("projects", { items });

    const moveProject = (index, dir) => {
        const items = [...sectionById("projects").data.items];
        const target = index + dir;
        if (target < 0 || target >= items.length) return;
        [items[index], items[target]] = [items[target], items[index]];
        updateProjects(items);
    };

    const removeProject = (index) =>
        updateProjects(sectionById("projects").data.items.filter((_, i) => i !== index));

    /* ========================================================
       Save current profile
       ======================================================== */
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (!profileId.trim()) {
            setError("Please enter a unique profile ID before saving.");
            return;
        }

        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const newProfiles = {
                ...savedProfiles,
                [profileId.trim()]: {
                    page,
                    fontSettings,
                    colorSettings,
                }
            };
            setSavedProfiles(newProfiles);
            await persistence.setItem(
                "personal-page:profiles",
                JSON.stringify(newProfiles)
            );

            setSuccessMessage(`Profile "${profileId}" saved successfully!`);
            onSuccess?.(page);
        } catch (err) {
            logger.error("[PersonalPageEditor] Save failed:", err);
            setError("Failed to save profile.");
        } finally {
            setLoading(false);
        }
    };

    /* ========================================================
   Clear all saved profiles
   ======================================================== */
    const handleClearProfiles = async () => {
        try {
            if (!Object.keys(savedProfiles).length) {
                logger.info("[PersonalPageEditor] No profiles to clear");
                return;
            }

            const confirmed = window.confirm(
                "This will permanently delete ALL saved profiles. Are you sure?"
            );

            if (!confirmed) return;

            setSavedProfiles({});
            setProfileId("");

            await persistence.setItem(
                "personal-page:profiles",
                JSON.stringify({})
            );

            setSuccessMessage("All saved profiles have been cleared.");
            logger.info("[PersonalPageEditor] All profiles cleared");
        } catch (err) {
            logger.error("[PersonalPageEditor] Failed to clear profiles:", err);
            setError("Failed to clear saved profiles.");
        }
    };

    /* ========================================================
       Load a saved profile by ID
       ======================================================== */
    const loadProfile = (id) => {
        const profile = savedProfiles[id];
        if (!profile) return;

        setPage(profile.page);
        setFontSettings(profile.fontSettings || { body: "Inter", heading: "Playfair Display" });
        setColorSettings(profile.colorSettings || {});
        setProfileId(id);
    };

    /* ========================================================
       Render
       ======================================================== */
    // const home = sectionById("home");
    // const about = sectionById("about");
    // const projects = sectionById("projects");
    // const contact = sectionById("contact");

    const home = getSectionSafe("home");
    const about = getSectionSafe("about");
    const projects = getSectionSafe("projects");
    const contact = getSectionSafe("contact");


    return (
        <>
            {/* Header */}
            <div className="editor-header global-editor-header box">
                <h2 className="title is-4 mb-0">Personal Page Editor</h2>
                <div className="is-flex is-align-items-center gap-4">
                    {/* Preview toggle */}
                    <div className="is-flex is-flex-direction-column is-align-items-center">
                        <span className="label has-text-grey">Preview</span>
                        <ToggleSwitch checked={previewVisible} onChange={setPreviewVisible} />
                    </div>
                </div>
            </div>

            {/* ---------- Profile Save Row ---------- */}
            <div className="profile-save-row box mb-4">
                <div className="is-flex is-align-items-center" style={{ gap: "0.75rem" }}>
                    {/* New Profile Button */}
                    <Tooltip text="Start a new profile">
                        <button
                            className="button is-light"
                            type="button"
                            onClick={() => {
                                setProfileId("");
                                setPage(DEFAULT_PAGE);
                                setFontSettings({ body: "Inter", heading: "Playfair Display" });
                                setColorSettings({});
                            }}
                        >
                            +
                        </button>
                    </Tooltip>

                    {/* Profile ID input */}
                    <Tooltip text="Enter a unique ID for this profile">
                        <input
                            className="input"
                            placeholder="Profile ID"
                            value={profileId}
                            onChange={(e) => setProfileId(e.target.value)}
                            style={{ maxWidth: "200px", flex: "0 0 auto" }}
                        />
                    </Tooltip>

                    {/* Save button */}
                    <Tooltip text="Save the current profile">
                        <button
                            className="button is-success"
                            disabled={loading}
                            onClick={handleSaveProfile}
                        >
                            {loading ? "Saving..." : "Save Profile"}
                        </button>
                    </Tooltip>

                    {/* Clear all button */}
                    <Tooltip text="Delete all saved profiles">
                        <button
                            className="button is-danger is-light"
                            disabled={!Object.keys(savedProfiles).length}
                            onClick={handleClearProfiles}
                        >
                            Clear All
                        </button>
                    </Tooltip>

                    {/* Saved Profiles Selector */}
                    <Tooltip text="Load a previously saved profile">
                        <div style={{ flex: 1, minWidth: "180px" }}>
                            <PortalContainer id="editor-dropdowns">
                                {(portalTarget) => (
                                    <SingleSelector
                                        options={Object.keys(savedProfiles).map((id) => ({
                                            value: id,
                                            label: id,
                                        }))}
                                        value={profileId}
                                        onChange={loadProfile}
                                        placeholder="Select a saved profile..."
                                        searchable={true}
                                        portalTarget={portalTarget}
                                    />
                                )}
                            </PortalContainer>
                        </div>
                    </Tooltip>
                </div>
            </div>

            {/* ---------- Main Layout ---------- */}
            <div className="columns is-variable is-6">
                {/* Editor Column */}
                <div className={`column ${previewVisible ? "is-6" : "is-12"} editor-column`}>
                    <div className="editor-scroll">

                        {previewEl && (
                            <>
                                {logger.debug("[PersonalPageEditor] Mounting style providers")}
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
                            </>
                        )}

                        {/* ---------- Home Section ---------- */}
                        <SectionCard
                            title={<EditableTitle value={home.title} defaultValue={home.defaultTitle} onChange={(val) => updateSectionTitle("home", val)} />}
                            headerExtra={<ToggleSectionTitleHelper sectionId="home" showTitle={home.showTitle} />}
                            enabled={home.enabled}
                            onChange={(v) => toggleSection("home", v)}
                        >
                            <input className="input mb-2" placeholder="Name" value={home.data.name} onChange={(e) => updateSection("home", { name: e.target.value })} />
                            <input className="input mb-2" placeholder="Tagline" value={home.data.tagline} onChange={(e) => updateSection("home", { tagline: e.target.value })} />
                            <input className="input" placeholder="Profile Image URL" value={home.data.profileImage} onChange={(e) => updateSection("home", { profileImage: e.target.value })} />
                        </SectionCard>

                        {/* ---------- About Section ---------- */}
                        <SectionCard
                            title={<EditableTitle value={about.title} defaultValue={about.defaultTitle} onChange={(val) => updateSectionTitle("about", val)} />}
                            headerExtra={<ToggleSectionTitleHelper sectionId="about" showTitle={about.showTitle} />}
                            enabled={about.enabled}
                            onChange={(v) => toggleSection("about", v)}
                        >
                            <RumpusQuill
                                value={about.data.content}
                                ref={aboutRef}
                                setValue={(val) => updateSection("about", { content: val })}
                                placeholder="Write your bio..." />

                            {/* Editor Buttons */}
                            {/* TODO: can we move these to the RumpusQuill toolbar? */}
                            <Tooltip text="Clear the contents of the editor">
                                <button
                                    type="button"
                                    className="button is-danger is-light is-small mt-2"
                                    onClick={() => {
                                        if (aboutRef.current?.getEditor) { // Use the ref to access the Quill instance and clear it
                                            aboutRef.current.getEditor().setContents("");
                                        }
                                        updateSection("about", { content: "" }); // Also clear the state
                                    }}
                                >
                                    Clear
                                </button>
                            </Tooltip>
                            <Tooltip text="Undo the last change">
                                <button
                                    type="button"
                                    className="button is-light is-small mt-2 ml-2"
                                    onClick={() => {
                                        const editor = aboutRef.current?.getEditor?.();
                                        if (editor) {
                                            editor.history.undo(); // Undo the last change
                                        }
                                    }}
                                >
                                    Undo
                                </button>
                            </Tooltip>
                            <Tooltip text="Redo the last undone change">
                                <button
                                    type="button"
                                    className="button is-light is-small mt-2 ml-1"
                                    onClick={() => {
                                        const editor = aboutRef.current?.getEditor?.();
                                        if (editor) {
                                            editor.history.redo();
                                            updateSection("about", { content: editor.root.innerHTML });
                                        }
                                    }}
                                >
                                    Redo
                                </button>
                            </Tooltip>

                        </SectionCard>

                        {/* ---------- Projects Section ---------- */}
                        <SectionCard
                            title={<EditableTitle value={projects.title} defaultValue={projects.defaultTitle} onChange={(val) => updateSectionTitle("projects", val)} />}
                            headerExtra={<ToggleSectionTitleHelper sectionId="projects" showTitle={projects.showTitle} />}
                            enabled={projects.enabled}
                            onChange={(v) => toggleSection("projects", v)}
                        >
                            <button type="button" className="button is-small mb-3" onClick={() => updateProjects([...projects.data.items, { title: "", link: "" }])}>
                                + Add Project
                            </button>
                            {projects.data.items.map((p, i) => (
                                <div key={i} className="box mb-3">
                                    <input className="input mb-2" placeholder="Project title" value={p.title} onChange={(e) => { const items = [...projects.data.items]; items[i].title = e.target.value; updateProjects(items); }} />
                                    <input className="input mb-3" placeholder="Project link" value={p.link} onChange={(e) => { const items = [...projects.data.items]; items[i].link = e.target.value; updateProjects(items); }} />
                                    <div className="buttons">
                                        <button type="button" className="button is-small" onClick={() => moveProject(i, -1)}>↑</button>
                                        <button type="button" className="button is-small" onClick={() => moveProject(i, 1)}>↓</button>
                                        <button type="button" className="button is-small is-danger" onClick={() => removeProject(i)}>Remove</button>
                                    </div>
                                </div>
                            ))}
                        </SectionCard>

                        {/* ---------- Contact Section ---------- */}
                        <SectionCard
                            title={<EditableTitle value={contact.title} defaultValue={contact.defaultTitle} onChange={(val) => updateSectionTitle("contact", val)} />}
                            headerExtra={<ToggleSectionTitleHelper sectionId="contact" showTitle={contact.showTitle} />}
                            enabled={contact.enabled}
                            onChange={(v) => toggleSection("contact", v)}
                        >
                            <input className="input" placeholder="Email" type="email" value={contact.data.email} onChange={(e) => updateSection("contact", { email: e.target.value })} />
                        </SectionCard>

                        {/* ---------- Alerts ---------- */}
                        {error && <Alert message={error} type="error" persistent={false} size="medium" position="bottom" onClose={() => setError(null)} />}
                        {successMessage && <Alert message={successMessage} type="success" persistent={false} size="medium" position="bottom" onClose={() => setSuccessMessage(null)} />}
                    </div>
                </div>

                {/* Preview Column */}
                {previewVisible && (
                    <div className="column is-6" ref={setPreviewEl}>
                        <div className="page-preview-frame">
                            <PagePreview page={page} />
                        </div>
                    </div>
                )}
            </div >
        </>
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

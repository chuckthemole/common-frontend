import React, { useState, useRef } from "react";
import RumpusQuill from "../../ui/editors/rumpus_quill";
import RumpusQuillForm from "../../ui/editors/rumpus_quill_form";
import SingleSelector from "../../dashboard-elements/single-selector/single-selector";
import ToggleSwitch from "../../dashboard-elements/toggle-switch/toggle-switch";
import { getApi } from "../../../api";
import logger from "../../../logger";
import PagePreview from "./page-preview";
import Alert from "../../ui/alerts/alert";
import FontSettingsModal from "../../design-control/font/font_settings_modal";
import ColorSettingsModal from "../../design-control/color/color_settings_modal";
import { useFontSettings, FontSettingsProvider } from "../../../../dist/components/design-control/font";

// Available themes
const THEMES = [
    { value: "modern", label: "Modern (default)" },
    { value: "minimal", label: "Minimal" },
    { value: "portfolio", label: "Portfolio Focused" },
];

/* ============================================================
   Page Style Controls (Theme + Font + Color)
   ============================================================ */
function PageStyleControls({ previewRef, page, setPage, colorSettings, setColorSettings }) {
    const fontSettings = useFontSettings();

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
                    <FontSettingsModal preview fontSettings={fontSettings} buttonLabel="Fonts" />
                    <ColorSettingsModal
                        onChange={setColorSettings}
                        currentSettings={colorSettings}
                        buttonLabel="Colors"
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
                    <button
                        type="button"
                        className="button is-small is-light"
                        onClick={() => setEditing(true)}
                        title="Edit title"
                    >
                        ✎
                    </button>
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
   Main Personal Page Editor
   ============================================================ */
export default function PersonalPageEditor({ endpoint, onSuccess }) {
    const [page, setPage] = useState({
        theme: "modern",
        sections: [
            {
                id: "home",
                type: "home",
                enabled: true,
                defaultTitle: "Home",
                title: "Home",
                data: { name: "", tagline: "", profileImage: "" },
            },
            {
                id: "about",
                type: "about",
                enabled: true,
                defaultTitle: "About",
                title: "About",
                data: { content: "" },
            },
            {
                id: "projects",
                type: "projects",
                enabled: true,
                defaultTitle: "Projects",
                title: "Projects",
                data: { items: [] },
            },
            {
                id: "contact",
                type: "contact",
                enabled: true,
                defaultTitle: "Contact",
                title: "Contact",
                data: { email: "" },
            },
        ],
    });

    const previewRef = useRef(null);
    const aboutRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [colorSettings, setColorSettings] = useState({});

    // Helper: get section by ID
    const sectionById = (id) => page.sections.find((s) => s.id === id);

    // Update section data
    const updateSection = (id, updater) =>
        setPage((prev) => ({
            ...prev,
            sections: prev.sections.map((s) =>
                s.id === id ? { ...s, data: { ...s.data, ...updater } } : s
            ),
        }));

    // Toggle section enabled/disabled
    const toggleSection = (id, enabled) =>
        setPage((prev) => ({
            ...prev,
            sections: prev.sections.map((s) => (s.id === id ? { ...s, enabled } : s)),
        }));

    // Update section title
    const updateSectionTitle = (id, newTitle) =>
        setPage((prev) => ({
            ...prev,
            sections: prev.sections.map((s) =>
                s.id === id ? { ...s, title: newTitle } : s
            ),
        }));

    // Project helpers
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

    // Save page
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const api = getApi();
            const res = await api.post(endpoint, page);
            if (onSuccess) onSuccess(res.data);
        } catch (err) {
            logger.error(err);
            setError("Failed to save changes.");
        } finally {
            setLoading(false);
        }
    };

    const home = sectionById("home");
    const about = sectionById("about");
    const projects = sectionById("projects");
    const contact = sectionById("contact");

    return (
        <RumpusQuillForm>
            {/* ---------- Header ---------- */}
            <div className="editor-header global-editor-header">
                <h2 className="title is-4 mb-0">Personal Page Editor</h2>
                <div className="is-flex is-align-items-center">
                    <span className="mr-2 has-text-grey">Preview</span>
                    <ToggleSwitch checked={previewVisible} onChange={setPreviewVisible} />
                    <button className="button is-link ml-4" disabled={loading} onClick={handleSubmit}>
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
                                body: { cssVar: "--page-font", default: "Inter" },
                                heading: { cssVar: "--heading-font", default: "Playfair Display" },
                            }}
                        >
                            <PageStyleControls
                                previewRef={previewRef}
                                page={page}
                                setPage={setPage}
                                colorSettings={colorSettings}
                                setColorSettings={setColorSettings}
                            />
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
                    </div>
                </div>

                {/* ---------- Preview Column ---------- */}
                {previewVisible && (
                    <div className="column is-6">
                        <div
                            className="page-preview-frame"
                            ref={previewRef}
                            style={{
                                "--page-font": "Inter",
                                "--heading-font": "Playfair Display",
                            }}
                        >
                            <PagePreview page={page} />
                        </div>
                    </div>
                )}
            </div>
        </RumpusQuillForm>
    );
}

/* ---------- SectionCard Helper ---------- */
const SectionCard = ({ title, enabled, onChange, children }) => (
    <div className="box mb-5">
        <div className="is-flex is-justify-content-space-between is-align-items-center mb-3">
            <h3 className="title is-5 mb-0">{title}</h3>
            <ToggleSwitch checked={enabled} onChange={onChange} />
        </div>
        {enabled && children}
    </div>
);

import React, { useState, useRef } from "react";
import RumpusQuill from "../../ui/editors/rumpus_quill";
import RumpusQuillForm from "../../ui/editors/rumpus_quill_form";
import SingleSelector from "../../dashboard-elements/single-selector/single-selector";
import ToggleSwitch from "../../dashboard-elements/toggle-switch/toggle-switch";
import { getApi } from "../../../api";
import logger from "../../../logger";
import PagePreview from "./page-preview";

const THEMES = [
    { value: "modern", label: "Modern (default)" },
    { value: "minimal", label: "Minimal" },
    { value: "portfolio", label: "Portfolio Focused" },
];

export default function PersonalPageEditor({ endpoint, onSuccess }) {
    const [page, setPage] = useState({
        theme: "modern",
        sections: [
            { id: "hero", type: "hero", enabled: true, data: { name: "", tagline: "", profileImage: "" } },
            { id: "about", type: "about", enabled: true, data: { content: "" } },
            { id: "projects", type: "projects", enabled: true, data: { items: [] } },
            { id: "contact", type: "contact", enabled: true, data: { email: "" } },
        ],
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [previewVisible, setPreviewVisible] = useState(false);

    const aboutRef = useRef(null);

    const sectionById = (id) => page.sections.find((s) => s.id === id);

    const updateSection = (id, updater) => {
        setPage((prev) => ({
            ...prev,
            sections: prev.sections.map((s) =>
                s.id === id ? { ...s, data: { ...s.data, ...updater } } : s
            ),
        }));
    };

    const toggleSection = (id, enabled) => {
        setPage((prev) => ({
            ...prev,
            sections: prev.sections.map((s) =>
                s.id === id ? { ...s, enabled } : s
            ),
        }));
    };

    /* ---------- Project helpers ---------- */

    const updateProjects = (items) =>
        updateSection("projects", { items });

    const moveProject = (index, dir) => {
        const items = [...sectionById("projects").data.items];
        const target = index + dir;
        if (target < 0 || target >= items.length) return;
        [items[index], items[target]] = [items[target], items[index]];
        updateProjects(items);
    };

    const removeProject = (index) => {
        updateProjects(
            sectionById("projects").data.items.filter((_, i) => i !== index)
        );
    };

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

    const hero = sectionById("hero");
    const about = sectionById("about");
    const projects = sectionById("projects");
    const contact = sectionById("contact");

    return (
        <RumpusQuillForm>
            {/* ---------- Top Action Bar ---------- */}
            <div className="is-flex is-justify-content-space-between is-align-items-center mb-5">
                <h2 className="title is-4 mb-0">Personal Page Editor</h2>

                <div className="is-flex is-align-items-center">
                    <span className="mr-2 has-text-grey">Preview</span>
                    <ToggleSwitch
                        checked={previewVisible}
                        onChange={setPreviewVisible}
                    />

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
                <div className={`column ${previewVisible ? "is-6" : "is-12"} pr-4`}>
                    <form onSubmit={handleSubmit}>
                        {/* Theme */}
                        <div className="box mb-5">
                            <label className="label">Page Style</label>
                            <SingleSelector
                                options={THEMES}
                                value={page.theme}
                                onChange={(value) =>
                                    setPage((p) => ({ ...p, theme: value }))
                                }
                                searchable={false}
                            />
                        </div>

                        {/* HERO */}
                        <SectionCard
                            title="Hero"
                            enabled={hero.enabled}
                            onChange={(v) => toggleSection("hero", v)}
                        >
                            <input
                                className="input mb-2"
                                placeholder="Name"
                                onChange={(e) =>
                                    updateSection("hero", { name: e.target.value })
                                }
                            />
                            <input
                                className="input mb-2"
                                placeholder="Tagline"
                                onChange={(e) =>
                                    updateSection("hero", { tagline: e.target.value })
                                }
                            />
                            <input
                                className="input"
                                placeholder="Profile Image URL"
                                onChange={(e) =>
                                    updateSection("hero", { profileImage: e.target.value })
                                }
                            />
                        </SectionCard>

                        {/* ABOUT */}
                        <SectionCard
                            title="About"
                            enabled={about.enabled}
                            onChange={(v) => toggleSection("about", v)}
                        >
                            <RumpusQuill
                                value={about.data.content}
                                editor_ref={aboutRef}
                                setValue={(val) =>
                                    updateSection("about", { content: val })
                                }
                                placeholder="Write your bio..."
                            />
                        </SectionCard>

                        {/* PROJECTS */}
                        <SectionCard
                            title="Projects"
                            enabled={projects.enabled}
                            onChange={(v) => toggleSection("projects", v)}
                        >
                            <button
                                type="button"
                                className="button is-small mb-3"
                                onClick={() =>
                                    updateProjects([
                                        ...projects.data.items,
                                        { title: "", link: "" },
                                    ])
                                }
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
                                        <button
                                            type="button"
                                            className="button is-small"
                                            onClick={() => moveProject(i, -1)}
                                        >
                                            ↑
                                        </button>
                                        <button
                                            type="button"
                                            className="button is-small"
                                            onClick={() => moveProject(i, 1)}
                                        >
                                            ↓
                                        </button>
                                        <button
                                            type="button"
                                            className="button is-small is-danger"
                                            onClick={() => removeProject(i)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </SectionCard>

                        {/* CONTACT */}
                        <SectionCard
                            title="Contact"
                            enabled={contact.enabled}
                            onChange={(v) => toggleSection("contact", v)}
                        >
                            <input
                                className="input"
                                placeholder="Email"
                                type="email"
                                onChange={(e) =>
                                    updateSection("contact", { email: e.target.value })
                                }
                            />
                        </SectionCard>

                        {error && (
                            <p className="help is-danger mt-2">{error}</p>
                        )}
                    </form>
                </div>

                {/* ---------- Preview Column ---------- */}
                {previewVisible && (
                    <div className="column is-6 pl-4">
                        <PagePreview page={page} />
                    </div>
                )}
            </div>
        </RumpusQuillForm>
    );
}

/* ---------- UI Helpers ---------- */

const SectionCard = ({ title, enabled, onChange, children }) => (
    <div className="box mb-5">
        <div className="is-flex is-justify-content-space-between is-align-items-center mb-3">
            <h3 className="title is-5 mb-0">{title}</h3>
            <ToggleSwitch checked={enabled} onChange={onChange} />
        </div>
        {enabled && children}
    </div>
);

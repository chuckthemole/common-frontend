import React, { useEffect, useState } from "react";
import PortalContainer from "../../ui/portal-container";
import SingleSelector from "../../dashboard-elements/single-selector/single-selector";
import ToggleSwitch from "../../dashboard-elements/toggle-switch/toggle-switch";
import Tooltip from "../../ui/tooltip/tooltip";
import PagePreview from "./preview/page-preview";
import Alert from "../../ui/alerts/alert";
import logger from "../../../logger";
import { LocalPersistence } from "../../../persistence/persistence";
import { DEFAULT_PAGE, PAGE_STORAGE_KEY } from "./personal-page.schema";
import {
    HomeSection,
    AboutSection,
    ProjectsSection,
    ContactSection,
    PageStylePanel,
} from "./sections";
import { usePageSections } from "./use-page-sections";

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

    const [page, setPage] = useState(DEFAULT_PAGE);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [colorSettings, setColorSettings] = useState({});
    const [fontSettings, setFontSettings] = useState({});
    const [profileId, setProfileId] = useState("");
    const [savedProfiles, setSavedProfiles] = useState({});

    const {
        sectionById,
        getSectionSafe,
        updateSection,
        toggleSection,
        toggleSectionTitle,
        updateSectionTitle,
    } = usePageSections(page, setPage);

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

    const ToggleSectionTitleHelper = ({ sectionId, showTitle }) => (
        <Tooltip text="Show or hide this section’s title in the preview">
            <div className="is-flex is-flex-direction-column is-align-items-center ml-3">
                <ToggleSwitch checked={showTitle} color="is-info" onChange={(v) => toggleSectionTitle(sectionId, v)} />
            </div>
        </Tooltip>
    );

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
                                <PageStylePanel
                                    previewEl={previewEl}
                                    page={page}
                                    setPage={setPage}
                                    fontSettings={fontSettings}
                                    setFontSettings={setFontSettings}
                                    colorSettings={colorSettings}
                                    setColorSettings={setColorSettings}
                                />
                            </>
                        )}

                        {/* ---------- Sections ---------- */}
                        <HomeSection
                            section={home}
                            onToggle={(v) => toggleSection("home", v)}
                            onToggleTitle={(v) => toggleSectionTitle("home", v)}
                            onUpdateTitle={(v) => updateSectionTitle("home", v)}
                            onUpdate={(data) => updateSection("home", data)}
                        />

                        <AboutSection
                            section={about}
                            onToggle={(v) => toggleSection("about", v)}
                            onToggleTitle={(v) => toggleSectionTitle("about", v)}
                            onUpdateTitle={(val) => updateSectionTitle("about", val)}
                            onUpdate={(data) => updateSection("about", data)}
                        />

                        <ProjectsSection
                            section={projects}
                            onToggle={(v) => toggleSection("projects", v)}
                            onToggleTitle={(v) => toggleSectionTitle("projects", v)}
                            onUpdateTitle={(val) => updateSectionTitle("projects", val)}
                            onAddProject={() =>
                                updateProjects([...projects.data.items, { title: "", link: "" }])
                            }
                            onUpdateItems={(items) => updateProjects(items)}
                            onMoveProject={moveProject}
                            onRemoveProject={removeProject}
                        />

                        <ContactSection
                            section={contact}
                            onToggle={(v) => toggleSection("contact", v)}
                            onToggleTitle={(v) => toggleSectionTitle("contact", v)}
                            onUpdateTitle={(val) => updateSectionTitle("contact", val)}
                            onUpdate={(data) => updateSection("contact", data)}
                        />

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

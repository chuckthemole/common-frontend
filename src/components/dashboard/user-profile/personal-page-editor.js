import React, { useEffect, useState } from "react";
import {
    PortalContainer,
    Tooltip,
    Alert,
    ConfirmModal,
    useRumpusModal
} from "../../ui";
import { SingleSelector, ToggleSwitch } from "../../dashboard-elements";
import PagePreview from "./preview/page-preview";
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
import { debugImports } from "../../../utils";
import { useProfile } from "./profile/useProfile";

/**
 * DEBUG ONLY — Import Integrity Check
 */
// runImportDebug();

/* ============================================================
   PersonalPageEditor
   ============================================================ */
export default function PersonalPageEditor({
    onSuccess,
    persistence: persistenceProp
}) {
    const persistence = persistenceProp || LocalPersistence;
    const [previewEl, setPreviewEl] = useState(null);
    const [page, setPage] = useState(DEFAULT_PAGE);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [colorSettings, setColorSettings] = useState({});
    const [fontSettings, setFontSettings] = useState({});

    const {
        sectionById,
        getSectionSafe,
        updateSection,
        toggleSection,
        toggleSectionTitle,
        updateSectionTitle,
    } = usePageSections(page, setPage);

    const {
        profiles,
        activeProfileId,
        saveProfile,
        loadProfile,
        clearProfiles,
        findProfileById,
        setActiveProfileId,
    } = useProfile();

    const { openModal } = useRumpusModal();

    // DEBUG
    // useEffect(() => {
    //     logger.debug("[PersonalPageEditor] render", {
    //         previewVisible,
    //         hasPreviewEl: !!previewEl,
    //     });
    // });

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
       Save current profile
       ======================================================== */
    const handleSaveProfile = async (e) => {
        e.preventDefault();

        if (!activeProfileId?.trim()) {
            setError("Please enter a unique profile ID before saving.");
            return;
        }

        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            await saveProfile(activeProfileId, {
                page,
                fontSettings,
                colorSettings,
            });

            setSuccessMessage(`Profile "${activeProfileId}" saved successfully!`);
            onSuccess?.(page);
        } catch (err) {
            logger.error("[PersonalPageEditor] Save failed:", err);
            setError(err.message || "Failed to save profile.");
        } finally {
            setLoading(false);
        }
    };

    /* ========================================================
   Clear all saved profiles
   ======================================================== */
    const handleClearProfiles = async () => {
        if (!Object.keys(profiles).length) return;
        openModal("clearProfilesModal");
    };

    /* ========================================================
       Load a saved profile by ID
       ======================================================== */
    const handleLoadProfile = (id) => {
        const profile = loadProfile(id);
        if (!profile) return;

        setPage(profile.page);
        setFontSettings(profile.fontSettings || { body: "Inter", heading: "Playfair Display" });
        setColorSettings(profile.colorSettings || {});
    };

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
                                setActiveProfileId("");
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
                            value={activeProfileId || ""}
                            onChange={(e) => setActiveProfileId(e.target.value)}
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

                    {/* View Profile button */}
                    <Tooltip text="View the rendered personal page">
                        <button
                            className="button is-info"
                            disabled={!activeProfileId?.trim() || !findProfileById(activeProfileId)}
                            onClick={() => {
                                // Replace spaces with hyphens for URL
                                const safeId = activeProfileId.trim().replace(/\s+/g, "-");
                                window.open(`/profile/${safeId}`, "_blank");
                            }}
                        >
                            View Profile
                        </button>
                    </Tooltip>

                    {/* Clear all button */}
                    <Tooltip text="Delete all saved profiles">
                        <button
                            className="button is-danger is-light"
                            disabled={!Object.keys(profiles).length}
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
                                        options={Object.keys(profiles).map((id) => ({
                                            value: id,
                                            label: id,
                                        }))}
                                        value={activeProfileId}
                                        onChange={handleLoadProfile}
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
                                    profileId={activeProfileId}
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
                            onUpdate={(data) => updateSection("projects", data)}
                        />

                        <ContactSection
                            section={contact}
                            onToggle={(v) => toggleSection("contact", v)}
                            onToggleTitle={(v) => toggleSectionTitle("contact", v)}
                            onUpdateTitle={(val) => updateSectionTitle("contact", val)}
                            onUpdate={(data) => updateSection("contact", data)}
                        />

                        {/* ---------- Alerts ---------- */}
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

                {/* Preview Column */}
                {previewVisible && (
                    <div className="column is-6" ref={setPreviewEl}>
                        <div className="page-preview-frame">
                            <PagePreview page={page} />
                        </div>
                    </div>
                )}
            </div >

            <ConfirmModal
                modalId="clearProfilesModal"
                title="Delete All Profiles?"
                message="This will permanently delete ALL saved profiles. Are you sure?"
                confirmText="Delete All"
                cancelText="Cancel"
                danger
                onConfirm={async () => {
                    try {
                        await clearProfiles();
                        setSuccessMessage("All saved profiles have been cleared.");
                    } catch (err) {
                        logger.error("[PersonalPageEditor] Failed to clear profiles:", err);
                        setError("Failed to clear saved profiles.");
                    }
                }}
            />

        </>
    );
}

/**
 * DEBUG ONLY — Import Integrity Check
 *
 * Call this function if you hit runtime errors like:
 *   - "Element type is invalid"
 *   - Components rendering as <div> or not rendering
 *   - Issues after refactoring barrel (index.js) exports
 *
 * This logs whether each imported component is undefined or malformed
 * BEFORE React attempts to render, making import/export issues obvious.
 */
function runImportDebug() {
    debugImports("PersonalPageEditor", {
        PortalContainer,
        Tooltip,
        Alert,
        SingleSelector,
        ToggleSwitch,
        PagePreview,
    });
}
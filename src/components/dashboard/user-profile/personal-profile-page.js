import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import PagePreview from "./preview/page-preview";
import { Alert } from "../../ui";
import { LocalPersistence } from "../../../persistence/persistence";
import { PageThemeProvider } from "./page-theme-provider";
import logger from "../../../logger";

/**
 * ThemedPagePreview
 * -----------------
 * Thin composition layer:
 * - Applies theming
 * - Delegates rendering to PagePreview
 * - Never owns data loading
 */
function ThemedPagePreview({ page, colorSettings, fontSettings }) {
    return (
        <PageThemeProvider
            colorSettings={colorSettings}
            fontSettings={fontSettings}
        >
            <PagePreview page={page} />
        </PageThemeProvider>
    );
}

/**
 * PersonalProfilePage
 * -------------------
 * Responsibilities:
 * - Load profile data from persistence
 * - Validate structure
 * - Handle routing param
 * - Apply theming composition
 * - Render preview safely
 * - Never assume data shape
 */
export default function PersonalProfilePage({ persistence: persistenceProp }) {
    const persistence = persistenceProp || LocalPersistence;
    const { id } = useParams(); // route: /profile/:id

    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    /**
     * Normalize route param
     * ---------------------
     * WARNING:
     * This is a fragile mapping if names can contain hyphens.
     * Long-term solution: use stable IDs, not names.
     */
    const normalizedId = useMemo(() => {
        if (!id || typeof id !== "string") return null;
        return id.replace(/-/g, " ");
    }, [id]);

    useEffect(() => {
        let cancelled = false;

        async function loadProfile() {
            setLoading(true);
            setError(null);

            logger.info("[PersonalProfilePage] Loading profile", {
                routeId: id,
                normalizedId,
                persistence: persistence?.constructor?.name || "unknown",
            });

            try {
                if (!persistence?.getItem) {
                    throw new Error("Invalid persistence adapter: missing getItem()");
                }

                const raw = await persistence.getItem("personal-page:profiles");

                if (cancelled) return;

                if (!raw) {
                    logger.warn("[PersonalProfilePage] No profiles found in storage");
                    throw new Error("No profiles exist in storage.");
                }

                let parsed;
                try {
                    parsed = JSON.parse(raw);
                } catch (jsonErr) {
                    logger.error("[PersonalProfilePage] JSON parse failure", jsonErr);
                    throw new Error("Stored profile data is corrupted.");
                }

                if (!parsed || typeof parsed !== "object") {
                    throw new Error("Profiles store is not an object.");
                }

                if (!normalizedId) {
                    throw new Error("Invalid profile id from route.");
                }

                const profileData = parsed[normalizedId];

                if (!profileData) {
                    logger.warn("[PersonalProfilePage] Profile not found", {
                        normalizedId,
                        availableProfiles: Object.keys(parsed),
                    });
                    throw new Error(`Profile "${normalizedId}" not found.`);
                }

                // ---------- Schema validation ----------
                if (!profileData.page) {
                    throw new Error(`Profile "${normalizedId}" is missing "page" data.`);
                }

                if (typeof profileData.page !== "object") {
                    throw new Error(`Profile "${normalizedId}".page is not an object.`);
                }

                // Optional but validated
                const safeColorSettings =
                    profileData.colorSettings && typeof profileData.colorSettings === "object"
                        ? profileData.colorSettings
                        : null;

                const safeFontSettings =
                    profileData.fontSettings && typeof profileData.fontSettings === "object"
                        ? profileData.fontSettings
                        : null;

                const safeProfile = {
                    ...profileData,
                    colorSettings: safeColorSettings,
                    fontSettings: safeFontSettings,
                };

                logger.info("[PersonalProfilePage] Profile loaded successfully", {
                    id: normalizedId,
                    hasPage: !!safeProfile.page,
                    hasColorSettings: !!safeProfile.colorSettings,
                    hasFontSettings: !!safeProfile.fontSettings,
                });

                if (!cancelled) {
                    setProfile(safeProfile);
                }

            } catch (err) {
                logger.error("[PersonalProfilePage] Load failure", {
                    error: err,
                    message: err?.message,
                    stack: err?.stack,
                });

                if (!cancelled) {
                    setError(err?.message || "Failed to load profile.");
                    setProfile(null);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadProfile();

        return () => {
            cancelled = true;
        };
    }, [id, normalizedId, persistence]);

    /* ---------------- Render States ---------------- */

    if (loading) {
        return (
            <div className="has-text-centered mt-6">
                Loading profile...
            </div>
        );
    }

    if (error) {
        return (
            <div className="mt-6">
                <Alert
                    message={error}
                    type="error"
                    persistent={false}
                    size="medium"
                    position="top"
                    onClose={() => setError(null)}
                />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="mt-6 has-text-centered">
                <Alert
                    message="Profile data unavailable."
                    type="error"
                    persistent={false}
                    size="medium"
                    position="top"
                />
            </div>
        );
    }

    /* ---------------- Safe Render ---------------- */

    try {
        return (
            <div className="page-preview-frame">
                <ThemedPagePreview
                    page={profile.page}
                    colorSettings={profile.colorSettings}
                    fontSettings={profile.fontSettings}
                />
            </div>
        );
    } catch (renderErr) {
        logger.error("[PersonalProfilePage] Render crash", {
            error: renderErr,
            message: renderErr?.message,
            stack: renderErr?.stack,
            profile,
        });

        return (
            <div className="mt-6">
                <Alert
                    message="An unexpected rendering error occurred."
                    type="error"
                    persistent={false}
                    size="medium"
                    position="top"
                />
            </div>
        );
    }
}

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ProfileContext } from "./profile-context";
import logger from "../../../../logger";
import { LocalPersistence } from "../../../../persistence";

/**
 * Storage key for all personal page profiles
 */
const PROFILE_STORAGE_KEY = "personal-page:profiles";

/**
 * ProfileProvider
 *
 * Responsibilities:
 * - Load all persisted profiles on mount
 * - Provide a stable API for profile CRUD
 * - Persist changes atomically
 * - Remain UI-agnostic (no alerts, no confirms)
 *
 * Design notes:
 * - This provider does NOT manage draft/editor state
 * - Callers decide when to save/load profiles
 */
export default function ProfileProvider({
    children,
    persistence: persistenceProp,
}) {
    const persistence = persistenceProp || LocalPersistence;

    const [profiles, setProfiles] = useState({});
    const [activeProfileId, setActiveProfileId] = useState(null);
    const [loading, setLoading] = useState(true);

    // Prevent state updates after unmount
    const cancelledRef = useRef(false);

    /* ========================================================
       Initial load
       ======================================================== */
    useEffect(() => {
        cancelledRef.current = false;

        const loadProfiles = async () => {
            try {
                const stored = await persistence.getItem(PROFILE_STORAGE_KEY);
                if (!stored || cancelledRef.current) {
                    setLoading(false);
                    return;
                }

                const parsed = JSON.parse(stored);
                setProfiles(parsed);
            } catch (err) {
                logger.error("[ProfileProvider] Failed to load profiles:", err);
            } finally {
                if (!cancelledRef.current) {
                    setLoading(false);
                }
            }
        };

        loadProfiles();

        return () => {
            cancelledRef.current = true;
        };
    }, [persistence]);

    /* ========================================================
       Persistence helper
       ======================================================== */
    const persistProfiles = useCallback(
        async (nextProfiles) => {
            await persistence.setItem(
                PROFILE_STORAGE_KEY,
                JSON.stringify(nextProfiles)
            );
        },
        [persistence]
    );

    /* ========================================================
       Actions
       ======================================================== */

    /**
     * Save or overwrite a profile by ID
     */
    const saveProfile = useCallback(
        async (id, profile) => {
            if (!id || !id.trim()) {
                throw new Error("Profile ID is required");
            }

            const safeId = id.trim();

            setProfiles((prev) => {
                const next = {
                    ...prev,
                    [safeId]: profile,
                };

                // Persist async but based on next state
                persistProfiles(next).catch((err) => {
                    logger.error("[ProfileProvider] Failed to persist profiles:", err);
                });

                return next;
            });

            setActiveProfileId(safeId);
        },
        [persistProfiles]
    );

    /**
     * Load a profile by ID (sets active profile only)
     * Caller decides what to do with the profile data.
     */
    const loadProfile = useCallback(
        (id) => {
            if (!profiles[id]) return null;

            setActiveProfileId(id);
            return profiles[id];
        },
        [profiles]
    );

    /**
     * Find a profile without mutating state
     */
    const findProfileById = useCallback(
        (id) => {
            return profiles[id] || null;
        },
        [profiles]
    );

    /**
     * Clear all saved profiles
     */
    const clearProfiles = useCallback(async () => {
        setProfiles({});
        setActiveProfileId(null);

        try {
            await persistProfiles({});
        } catch (err) {
            logger.error("[ProfileProvider] Failed to clear profiles:", err);
            throw err;
        }
    }, [persistProfiles]);

    /* ========================================================
       Memoized context value
       ======================================================== */
    const value = useMemo(
        () => ({
            profiles,
            activeProfileId,
            loading,

            saveProfile,
            loadProfile,
            findProfileById,
            clearProfiles,
            setActiveProfileId,
        }),
        [
            profiles,
            activeProfileId,
            loading,
            saveProfile,
            loadProfile,
            findProfileById,
            clearProfiles,
        ]
    );

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
}

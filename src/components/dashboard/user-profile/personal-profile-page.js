import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PagePreview from "./preview/page-preview";
import { Alert } from "../../ui"
import { LocalPersistence } from "../../../persistence/persistence";
import logger from "../../../logger";

export default function PersonalProfilePage({ persistence: persistenceProp }) {
    const persistence = persistenceProp || LocalPersistence;
    const { id } = useParams(); // from /profile/:id
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const loadProfile = async () => {
            try {
                const storedProfiles = await persistence.getItem("personal-page:profiles");
                if (!storedProfiles || cancelled) return;

                const parsedProfiles = JSON.parse(storedProfiles);

                // Convert hyphens back to spaces to match saved keys
                const originalId = id.replace(/-/g, " ");

                const profileData = parsedProfiles[originalId];
                if (!profileData) {
                    setError(`Profile "${originalId}" not found.`);
                    return;
                }

                setProfile(profileData);
            } catch (err) {
                logger.error("[PersonalProfilePage] Failed to load profile:", err);
                setError("Failed to load profile.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadProfile();

        return () => {
            cancelled = true;
        };
    }, [id, persistence]);

    if (loading) {
        return <div className="has-text-centered mt-6">Loading profile...</div>;
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

    return (
        <div className="personal-profile-page">
            {profile && (
                <PagePreview page={profile.page} />
            )}
        </div>
    );
}

import { useContext } from "react";
import { ProfileContext } from "./profile-context";

/**
 * useProfile
 *
 * Ergonomic hook for accessing profile state + actions.
 * Must be used inside <ProfileProvider>.
 */
export function useProfile() {
    const ctx = useContext(ProfileContext);

    if (!ctx) {
        throw new Error("useProfile must be used within a ProfileProvider");
    }

    return ctx;
}

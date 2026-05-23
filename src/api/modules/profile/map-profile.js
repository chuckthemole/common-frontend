import logger from "../../../logger";

/**
 * Normalize backend profile objects into clean frontend domain objects.
 *
 * Removes:
 *  - logger objects
 *  - password fields
 *  - Spring Security serialization noise
 *  - EMPTY_FIELD placeholders
 *
 * Produces a frontend-friendly shape.
 */
export function mapProfile(rawProfile) {
    logger.debug("[mapProfile] mapping profile", {
        rawProfile,
    });

    if (!rawProfile) {
        logger.warn("[mapProfile] received falsy profile", {
            rawProfile,
        });

        return null;
    }

    const profileDetails = rawProfile.profile ?? {};

    const mappedProfile = {
        id: rawProfile.id ?? null,
        enabled: Boolean(profileDetails.enabled),
    };

    logger.debug("[mapProfile] mapped profile result", {
        mappedProfile,
    });

    return mappedProfile;
}

/**
 * Map an array of profiles safely.
 */
export function mapProfiles(profiles) {
    logger.debug("[mapProfiles] mapping profiles", {
        profilesCount: Array.isArray(profiles)
            ? profiles.length
            : 0,
    });

    if (!Array.isArray(profiles)) {
        logger.warn("[mapProfiles] profiles is not an array", {
            profiles,
        });

        return [];
    }

    return profiles
        .map(mapProfile)
        .filter(Boolean);
}
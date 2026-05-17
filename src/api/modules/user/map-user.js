import logger from "../../../logger";

/**
 * Normalize backend user objects into clean frontend domain objects.
 *
 * Removes:
 *  - logger objects
 *  - password fields
 *  - Spring Security serialization noise
 *  - EMPTY_FIELD placeholders
 *
 * Produces a frontend-friendly shape.
 */
export function mapUser(rawUser) {
    logger.debug("[mapUser] mapping user", {
        rawUser,
    });

    if (!rawUser) {
        logger.warn("[mapUser] received falsy user", {
            rawUser,
        });

        return null;
    }

    const userDetails = rawUser.userDetails ?? {};
    const metaData = rawUser.metaData ?? {};

    const mappedUser = {
        // ---------------------------------------------------------------------
        // Identity
        // ---------------------------------------------------------------------
        id: rawUser.id ?? null,
        username:
            rawUser.username ??
            userDetails.username ??
            null,
        email: rawUser.email ?? null,

        // ---------------------------------------------------------------------
        // Status
        // ---------------------------------------------------------------------
        status: rawUser.status ?? null,

        // ---------------------------------------------------------------------
        // Security / Permissions
        // ---------------------------------------------------------------------
        roles: Array.isArray(userDetails.authorities)
            ? userDetails.authorities
                .map((a) => a?.authority)
                .filter(Boolean)
            : [],

        enabled: Boolean(userDetails.enabled),
        accountNonExpired: Boolean(
            userDetails.accountNonExpired
        ),
        accountNonLocked: Boolean(
            userDetails.accountNonLocked
        ),
        credentialsNonExpired: Boolean(
            userDetails.credentialsNonExpired
        ),

        // ---------------------------------------------------------------------
        // Metadata
        // ---------------------------------------------------------------------
        createdAt:
            metaData.standardFormattedCreationTime ??
            null,

        createdAtTimestamp:
            metaData.creationTime ?? null,

        // ---------------------------------------------------------------------
        // Profile
        // ---------------------------------------------------------------------
        photoLink:
            metaData.photoLink === "EMPTY_FIELD"
                ? null
                : metaData.photoLink,

        aboutMe:
            metaData.aboutMe === "EMPTY_FIELD"
                ? null
                : metaData.aboutMe,

        social: metaData.social ?? {},

        // ---------------------------------------------------------------------
        // Derived Values
        // ---------------------------------------------------------------------
        isAdmin: Array.isArray(userDetails.authorities)
            ? userDetails.authorities.some(
                (a) => a?.authority === "ROLE_ADMIN"
            )
            : false,

        isManager: Array.isArray(userDetails.authorities)
            ? userDetails.authorities.some(
                (a) => a?.authority === "ROLE_MANAGER"
            )
            : false,

        isEmployee: Array.isArray(userDetails.authorities)
            ? userDetails.authorities.some(
                (a) => a?.authority === "ROLE_EMPLOYEE"
            )
            : false,
    };

    logger.debug("[mapUser] mapped user result", {
        mappedUser,
    });

    return mappedUser;
}

/**
 * Map an array of users safely.
 */
export function mapUsers(users) {
    logger.debug("[mapUsers] mapping users", {
        usersCount: Array.isArray(users)
            ? users.length
            : 0,
    });

    if (!Array.isArray(users)) {
        logger.warn("[mapUsers] users is not an array", {
            users,
        });

        return [];
    }

    return users
        .map(mapUser)
        .filter(Boolean);
}
/**
 * -----------------------------------------------------------------------------
 * Default Profile Field Configuration
 * -----------------------------------------------------------------------------
 *
 * Field schema drives:
 * - visibility
 * - readonly behavior
 * - labels
 * - future validation
 * - future formatting
 * - permissions
 *
 * -----------------------------------------------------------------------------
 */
export const DEFAULT_PROFILE_FIELDS = [
    /**
     * -------------------------------------------------------------------------
     * Core identity (top of form)
     * -------------------------------------------------------------------------
     */

    {
        key: "username",
        label: "Username",
        order: 1,
    },

    {
        key: "email",
        label: "Email",
        type: "email",
        order: 2,
    },

    /**
     * -------------------------------------------------------------------------
     * System identifiers
     * -------------------------------------------------------------------------
     */

    {
        key: "id",
        label: "User ID",
        readonly: true,
        order: 3,
    },

    /**
     * -------------------------------------------------------------------------
     * Permissions / roles (admin-only context)
     * -------------------------------------------------------------------------
     */

    {
        key: "userDetails.authorities",
        label: "Roles",
        readonly: true,
        adminOnly: true,
        order: 4,
    },

    /**
     * -------------------------------------------------------------------------
     * System metadata (hidden from UI)
     * -------------------------------------------------------------------------
     */

    {
        key: "createdAt",
        label: "Created",
        readonly: true,
        hidden: true,
        order: Number.MAX_SAFE_INTEGER,
    },

    {
        key: "updatedAt",
        label: "Last Updated",
        readonly: true,
        hidden: true,
        order: Number.MAX_SAFE_INTEGER,
    },

    {
        key: "password",
        hidden: true,
        order: Number.MAX_SAFE_INTEGER,
    },

    {
        key: "token",
        hidden: true,
        order: Number.MAX_SAFE_INTEGER,
    },

    {
        key: "permissions",
        hidden: true,
        order: Number.MAX_SAFE_INTEGER,
    },
];
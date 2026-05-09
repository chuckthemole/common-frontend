import React, { useMemo } from "react";
import PropTypes from "prop-types";

import { SidebarNavigation } from "../../ui";

/**
 * -----------------------------------------------------------------------------
 * UserSidebarNavigation
 * -----------------------------------------------------------------------------
 *
 * User-domain wrapper around SidebarNavigation.
 *
 * Responsibilities:
 *  - define default user navigation structure
 *  - inject user-specific sections
 *  - handle permission-aware rendering
 *  - provide sane defaults for user dashboards/settings
 *
 * -----------------------------------------------------------------------------
 * This component intentionally DOES NOT:
 * -----------------------------------------------------------------------------
 *
 * - own routing
 * - perform navigation directly
 * - fetch user data
 *
 * Those responsibilities belong to:
 *  - router layer
 *  - page layer
 *  - auth/user providers
 *
 * -----------------------------------------------------------------------------
 * Example
 * -----------------------------------------------------------------------------
 *
 * <UserSidebarNavigation
 *     activePath={location.pathname}
 *     onNavigate={(item) => navigate(item.href)}
 * />
 *
 * -----------------------------------------------------------------------------
 */

/**
 * -----------------------------------------------------------------------------
 * Default Navigation Configuration
 * -----------------------------------------------------------------------------
 *
 * This can later move into:
 *
 * /user/navigation/user-navigation.config.js
 *
 * if it grows significantly.
 */
const DEFAULT_SECTIONS = [
    {
        id: "account",

        label: "Account",

        collapsible: true,

        defaultOpen: true,

        items: [
            {
                id: "profile",

                label: "Profile",

                href: "/user/profile",
            },

            {
                id: "security",

                label: "Security",

                href: "/user/security",
            },

            {
                id: "preferences",

                label: "Preferences",

                href: "/user/preferences",
            },
        ],
    },

    {
        id: "activity",

        label: "Activity",

        collapsible: true,

        defaultOpen: true,

        items: [
            {
                id: "notifications",

                label: "Notifications",

                href: "/user/notifications",
            },

            {
                id: "retention",

                label: "Retention Policies",

                href: "/user/retention",
            },

            {
                id: "audit",

                label: "Audit Logs",

                href: "/user/audit",
            },
        ],
    },

    {
        id: "developer",

        label: "Developer",

        collapsible: true,

        defaultOpen: false,

        items: [
            {
                id: "api-keys",

                label: "API Keys",

                href: "/user/api-keys",
            },

            {
                id: "webhooks",

                label: "Webhooks",

                href: "/user/webhooks",
            },
        ],
    },
];

export default function UserSidebarNavigation({
    activePath = "",

    onNavigate,

    sections = null,

    user = null,

    width = 280,

    className = "",

    style = {},
}) {
    /**
     * -------------------------------------------------------------------------
     * Effective Sections
     * -------------------------------------------------------------------------
     *
     * Allows consumers to either:
     *
     * 1. supply fully custom navigation
     * 2. use built-in defaults
     */
    const effectiveSections = useMemo(() => {
        const baseSections =
            sections ||
            DEFAULT_SECTIONS;

        /**
         * ---------------------------------------------------------------------
         * Future Permission Filtering
         * ---------------------------------------------------------------------
         *
         * Example:
         *
         * return filterSectionsForUser(
         *     baseSections,
         *     user
         * );
         */
        return baseSections;
    }, [sections, user]);

    return (
        <SidebarNavigation
            sections={
                effectiveSections
            }
            activePath={
                activePath
            }
            onNavigate={
                onNavigate
            }
            width={width}
            className={
                className
            }
            style={style}
        />
    );
}

UserSidebarNavigation.propTypes = {
    /**
     * Current active route/path.
     */
    activePath:
        PropTypes.string,

    /**
     * Navigation callback.
     *
     * Receives clicked item.
     */
    onNavigate:
        PropTypes.func,

    /**
     * Optional custom sections override.
     */
    sections:
        PropTypes.array,

    /**
     * Optional current user object.
     *
     * Reserved for future permission-aware navigation filtering.
     */
    user:
        PropTypes.object,

    /**
     * Sidebar width.
     */
    width:
        PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
        ]),

    /**
     * Additional className.
     */
    className:
        PropTypes.string,

    /**
     * Inline style overrides.
     */
    style:
        PropTypes.object,
};
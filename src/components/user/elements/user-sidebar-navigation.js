import React, { useEffect, useMemo } from "react";
import PropTypes from "prop-types";

import { SidebarNavigation } from "../../ui";
import { DEFAULT_SECTIONS } from "../navigation/default-navigation.config";
import logger from "../../../logger";

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

    useEffect(() => {
        logger.debug("[UserSidebarNavigation] sections", sections);
    }, [sections]);

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
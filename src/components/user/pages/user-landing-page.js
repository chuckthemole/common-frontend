import React, { useMemo, useEffect } from "react";
import PropTypes from "prop-types";

import { DashboardLayout } from "../../pages";
import { UserSidebarNavigation } from "../";
import useCurrentUser from "../current-user/useCurrentUser";
import logger, { useScopedLogger } from "../../../logger";
import { DEFAULT_SECTIONS } from "../navigation/default-navigation.config";
import { Outlet } from "react-router-dom";

/**
 * Given a sectionId, will append newItems.
 * 
 * @param {*} sections 
 * @param {*} sectionId 
 * @param {*} newItems 
 * @returns 
 */
export function appendSectionItems(
    sections,
    sectionId,
    newItems
) {
    return sections.map((section) => {
        if (section.id !== sectionId) {
            return section;
        }

        return {
            ...section,
            items: [
                ...section.items,
                ...newItems,
            ],
        };
    });
}

/**
 * -----------------------------------------------------------------------------
 * UserLandingPage
 * -----------------------------------------------------------------------------
 *
 * Primary authenticated user landing/dashboard page.
 *
 * Responsibilities:
 *  - compose dashboard layout
 *  - provide user navigation shell
 *  - render high-level account overview
 *  - serve as entry point into user tools/settings
 *
 * -----------------------------------------------------------------------------
 */
export default function UserLandingPage({
    activePath = "",
    onNavigate,
    header = null,
    footer = null,
    children,
    sidebarSections = DEFAULT_SECTIONS,
}) {

    const SCOPED_LOGGER = useScopedLogger("UserLandingPage", logger);

    /**
     * -------------------------------------------------------------------------
     * Current User
     * -------------------------------------------------------------------------
     */
    const {
        user: currentUser,
        isAdmin
    } = useCurrentUser();

    /**
     * Debug: user object lifecycle
     */
    useEffect(() => {
        SCOPED_LOGGER.debug("user loaded", currentUser);
    }, [currentUser]);

    /**
     * Debug: props snapshot
     */
    useEffect(() => {
        SCOPED_LOGGER.debug("[UserLandingPage] props", {
            activePath,
            hasOnNavigate: !!onNavigate,
            hasHeader: !!header,
            hasFooter: !!footer,
            hasChildren: !!children,
        });
    }, [activePath, onNavigate, header, footer, children]);

    /**
     * -------------------------------------------------------------------------
     * Derived Display Name
     * -------------------------------------------------------------------------
     */
    const displayName = useMemo(() => {
        const name =
            currentUser?.username ||
            currentUser?.id ||
            currentUser?.email ||
            "User";

        SCOPED_LOGGER.debug("[UserLandingPage] displayName resolved", {
            displayName: name,
        });

        return name;
    }, [currentUser]);

    const adminSection =
        [
            {
                id: "privileged_user",

                label: "Privileged User",

                collapsible: false,

                defaultOpen: true,

                items: [
                    {
                        id: "admin",

                        label: "Admin",

                        href: "/admin",
                    },
                ],
            },
        ];

    const sectionItems = useMemo(() => {
        SCOPED_LOGGER.debug("User admin status", isAdmin);

        const baseSections = sidebarSections || DEFAULT_SECTIONS;

        const sectionsWithAdmin = isAdmin
            ? [...baseSections, ...adminSection]
            : baseSections;

        return sectionsWithAdmin;
    }, [isAdmin, sidebarSections]);


    /**
     * -------------------------------------------------------------------------
     * Sidebar
     * -------------------------------------------------------------------------
     */
    const sidebar = useMemo(() => {
        SCOPED_LOGGER.debug("[UserLandingPage] rendering sidebar", {
            currentUser,
            activePath,
            sectionItems
        });

        return (
            <UserSidebarNavigation
                activePath={activePath}
                onNavigate={onNavigate}
                user={currentUser}
                sections={sectionItems}
            />
        );
    }, [activePath, onNavigate, currentUser, sectionItems]);

    return (
        <DashboardLayout
            sidebar={sidebar}
            header={header}
            footer={footer}
        >
            <Outlet />
        </DashboardLayout>
    );
}

UserLandingPage.propTypes = {
    activePath: PropTypes.string,
    onNavigate: PropTypes.func,
    header: PropTypes.node,
    footer: PropTypes.node,
    children: PropTypes.node,
    sidebarSections: PropTypes.array,
};
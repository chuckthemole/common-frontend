import React, { useMemo, useEffect } from "react";
import PropTypes from "prop-types";

import { DashboardLayout } from "../../pages";
import { UserSidebarNavigation } from "../";
import useCurrentUser from "../current-user/useCurrentUser";
import logger, { useScopedLogger } from "../../../logger";
import { DEFAULT_SECTIONS } from "../navigation/default-navigation.config";

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
        logger.debug("[UserLandingPage] props", {
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
            currentUser?.user?.username ||
            currentUser?.user?.id ||
            currentUser?.user?.email ||
            "User";

        logger.debug("[UserLandingPage] displayName resolved", {
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

        return isAdmin
            ? [...DEFAULT_SECTIONS, ...adminSection]
            : [...DEFAULT_SECTIONS];
    }, [isAdmin]);


    /**
     * -------------------------------------------------------------------------
     * Sidebar
     * -------------------------------------------------------------------------
     */
    const sidebar = useMemo(() => {
        logger.debug("[UserLandingPage] rendering sidebar", {
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
            {/* ------------------------------------------------------------- */}
            {/* Welcome Section                                               */}
            {/* ------------------------------------------------------------- */}

            {logger.debug("[UserLandingPage] render main layout")}

            <section
                className="box"
                style={{ marginBottom: "1.5rem" }}
            >
                <h1 className="title is-3">
                    Welcome, {displayName}
                </h1>

                <p className="subtitle is-6">
                    Manage your account, preferences,
                    activity, and developer settings.
                </p>
            </section>

            {/* ------------------------------------------------------------- */}
            {/* Dashboard Content Area                                        */}
            {/* ------------------------------------------------------------- */}

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                }}
            >
                {children ? (
                    (() => {
                        logger.debug(
                            "[UserLandingPage] rendering custom children"
                        );
                        return children;
                    })()
                ) : (
                    <>
                        {logger.debug(
                            "[UserLandingPage] rendering default dashboard content"
                        )}

                        <div className="columns">
                            <div className="column">
                                <div className="box">
                                    <h2 className="title is-5">
                                        Account
                                    </h2>
                                    <p>
                                        View and manage your account
                                        information.
                                    </p>
                                </div>
                            </div>

                            <div className="column">
                                <div className="box">
                                    <h2 className="title is-5">
                                        Notifications
                                    </h2>
                                    <p>
                                        Configure alerts and communication
                                        preferences.
                                    </p>
                                </div>
                            </div>

                            <div className="column">
                                <div className="box">
                                    <h2 className="title is-5">
                                        Security
                                    </h2>
                                    <p>
                                        Update passwords, sessions, and
                                        access controls.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="box">
                            <h2 className="title is-5">
                                Recent Activity
                            </h2>

                            <p className="has-text-grey">
                                No recent activity.
                            </p>
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}

UserLandingPage.propTypes = {
    activePath: PropTypes.string,
    onNavigate: PropTypes.func,
    header: PropTypes.node,
    footer: PropTypes.node,
    children: PropTypes.node,
};
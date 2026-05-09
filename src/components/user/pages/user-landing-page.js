import React, { useMemo } from "react";
import PropTypes from "prop-types";

import { DashboardLayout } from "../../pages";
import { UserSidebarNavigation } from "../";
import useCurrentUser from "../current-user/useCurrentUser";

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
 * This page intentionally focuses on composition rather than business logic.
 * Complex domain behavior should live in:
 *
 *  - hooks
 *  - services
 *  - providers
 *  - feature components
 *
 * -----------------------------------------------------------------------------
 * Example
 * -----------------------------------------------------------------------------
 *
 * <UserLandingPage
 *     activePath={location.pathname}
 *     onNavigate={(item) => navigate(item.href)}
 * />
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
    /**
     * -------------------------------------------------------------------------
     * Current User
     * -------------------------------------------------------------------------
     */
    const currentUser =
        useCurrentUser?.() || null;

    /**
     * -------------------------------------------------------------------------
     * Derived Display Name
     * -------------------------------------------------------------------------
     */
    const displayName =
        useMemo(() => {
            return (
                currentUser
                    ?.displayName ||
                currentUser?.name ||
                currentUser?.email ||
                "User"
            );
        }, [currentUser]);

    /**
     * -------------------------------------------------------------------------
     * Sidebar
     * -------------------------------------------------------------------------
     */
    const sidebar = (
        <UserSidebarNavigation
            activePath={
                activePath
            }
            onNavigate={
                onNavigate
            }
            user={currentUser}
        />
    );

    return (
        <DashboardLayout
            sidebar={sidebar}
            header={header}
            footer={footer}
        >
            {/* ------------------------------------------------------------- */}
            {/* Welcome Section                                               */}
            {/* ------------------------------------------------------------- */}

            <section
                className="box"
                style={{
                    marginBottom: "1.5rem",
                }}
            >
                <h1 className="title is-3">
                    Welcome,{" "}
                    {displayName}
                </h1>

                <p className="subtitle is-6">
                    Manage your
                    account,
                    preferences,
                    activity,
                    and developer
                    settings.
                </p>
            </section>

            {/* ------------------------------------------------------------- */}
            {/* Dashboard Content Area                                        */}
            {/* ------------------------------------------------------------- */}

            <div
                style={{
                    display: "flex",
                    flexDirection:
                        "column",
                    gap: "1rem",
                }}
            >
                {children || (
                    <>
                        {/* ------------------------------------------------- */}
                        {/* Example Overview Cards                           */}
                        {/* ------------------------------------------------- */}

                        <div className="columns">
                            <div className="column">
                                <div className="box">
                                    <h2 className="title is-5">
                                        Account
                                    </h2>

                                    <p>
                                        View and
                                        manage your
                                        account
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
                                        Configure
                                        alerts and
                                        communication
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
                                        Update
                                        passwords,
                                        sessions,
                                        and access
                                        controls.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* ------------------------------------------------- */}
                        {/* Recent Activity                                  */}
                        {/* ------------------------------------------------- */}

                        <div className="box">
                            <h2 className="title is-5">
                                Recent Activity
                            </h2>

                            <p className="has-text-grey">
                                No recent
                                activity.
                            </p>
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}

UserLandingPage.propTypes = {
    /**
     * Current active route/path.
     */
    activePath:
        PropTypes.string,

    /**
     * Navigation callback.
     */
    onNavigate:
        PropTypes.func,

    /**
     * Optional layout header.
     */
    header:
        PropTypes.node,

    /**
     * Optional layout footer.
     */
    footer:
        PropTypes.node,

    /**
     * Optional custom page content.
     *
     * If omitted, default dashboard overview content is rendered.
     */
    children:
        PropTypes.node,
};
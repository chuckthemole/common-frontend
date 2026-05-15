import React, { useMemo } from "react";
import PropTypes from "prop-types";

/**
 * -----------------------------------------------------------------------------
 * UserLandingPageIndex
 * -----------------------------------------------------------------------------
 *
 * Default dashboard landing content shown at:
 * /home (index route)
 *
 * Pure presentational component:
 * - no routing logic
 * - no layout concerns
 * - no side effects or logging
 * - receives user context via props
 *
 * -----------------------------------------------------------------------------
 */
export default function UserLandingPageIndex({
    displayName,
}) {

    /**
     * -------------------------------------------------------------------------
     * Memoized content blocks (keeps render stable under re-renders)
     * -------------------------------------------------------------------------
     */
    const summaryCards = useMemo(() => {
        return (
            <div className="columns">
                <div className="column">
                    <div className="box">
                        <h2 className="title is-5">
                            Account
                        </h2>
                        <p>
                            View and manage your account information.
                        </p>
                    </div>
                </div>

                <div className="column">
                    <div className="box">
                        <h2 className="title is-5">
                            Notifications
                        </h2>
                        <p>
                            Configure alerts and communication preferences.
                        </p>
                    </div>
                </div>

                <div className="column">
                    <div className="box">
                        <h2 className="title is-5">
                            Security
                        </h2>
                        <p>
                            Update passwords, sessions, and access controls.
                        </p>
                    </div>
                </div>
            </div>
        );
    }, []);

    const recentActivity = useMemo(() => {
        return (
            <div className="box">
                <h2 className="title is-5">
                    Recent Activity
                </h2>

                <p className="has-text-grey">
                    No recent activity.
                </p>
            </div>
        );
    }, []);

    return (
        <>
            {/* --------------------------------------------------------- */}
            {/* Welcome Section                                          */}
            {/* --------------------------------------------------------- */}

            <section
                className="box"
                style={{ marginBottom: "1.5rem" }}
            >
                <h1 className="title is-3">
                    Welcome, {displayName}
                </h1>

                <p className="subtitle is-6">
                    Manage your account, preferences, activity, and developer settings.
                </p>
            </section>

            {/* --------------------------------------------------------- */}
            {/* Dashboard Content Area                                   */}
            {/* --------------------------------------------------------- */}

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                }}
            >
                {summaryCards}
                {recentActivity}
            </div>
        </>
    );
}

UserLandingPageIndex.propTypes = {
    /**
     * Display name of the current user.
     */
    displayName: PropTypes.string.isRequired,
};
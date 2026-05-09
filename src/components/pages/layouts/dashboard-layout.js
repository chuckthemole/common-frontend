import React from "react";
import PropTypes from "prop-types";

/**
 * -----------------------------------------------------------------------------
 * DashboardLayout
 * -----------------------------------------------------------------------------
 *
 * Reusable application/dashboard layout shell.
 *
 * Designed for:
 *  - settings pages
 *  - admin dashboards
 *  - analytics tools
 *  - CMS interfaces
 *  - internal tooling
 *
 * -----------------------------------------------------------------------------
 * Responsibilities
 * -----------------------------------------------------------------------------
 *
 * - sidebar positioning
 * - responsive content layout
 * - scroll containment
 * - page structure
 *
 * -----------------------------------------------------------------------------
 * Layout Structure
 * -----------------------------------------------------------------------------
 *
 * ---------------------------------------------------------
 * | Sidebar |                                             |
 * |         |               Main Content                  |
 * |         |                                             |
 * ---------------------------------------------------------
 *
 * -----------------------------------------------------------------------------
 * Example
 * -----------------------------------------------------------------------------
 *
 * <DashboardLayout
 *     sidebar={<UserSidebarNavigation />}
 * >
 *     <UserSettingsPage />
 * </DashboardLayout>
 *
 * -----------------------------------------------------------------------------
 */

const DEFAULT_SIDEBAR_WIDTH = 280;

export default function DashboardLayout({
    sidebar,
    children,

    header = null,
    footer = null,

    sidebarWidth = DEFAULT_SIDEBAR_WIDTH,

    fullHeight = true,

    contentClassName = "",
    contentStyle = {},

    className = "",
    style = {},
}) {
    /**
     * -------------------------------------------------------------------------
     * Normalized Sidebar Width
     * -------------------------------------------------------------------------
     */
    const normalizedSidebarWidth =
        typeof sidebarWidth === "number"
            ? `${sidebarWidth}px`
            : sidebarWidth;

    return (
        <div
            className={className}
            style={{
                display: "flex",

                width: "100%",

                height: fullHeight
                    ? "100vh"
                    : "100%",

                overflow: "hidden",

                background:
                    "var(--dashboard-background, #f5f5f5)",

                ...style,
            }}
        >
            {/* -----------------------------------------------------------------
             * Sidebar
             * ----------------------------------------------------------------- */}
            {sidebar && (
                <aside
                    style={{
                        width:
                            normalizedSidebarWidth,

                        minWidth:
                            normalizedSidebarWidth,

                        maxWidth:
                            normalizedSidebarWidth,

                        height: "100%",

                        overflowY: "auto",

                        borderRight:
                            "1px solid rgba(0,0,0,0.08)",

                        background:
                            "var(--dashboard-sidebar-background, white)",
                    }}
                >
                    {sidebar}
                </aside>
            )}

            {/* -----------------------------------------------------------------
             * Main Content Area
             * ----------------------------------------------------------------- */}
            <div
                style={{
                    display: "flex",

                    flexDirection: "column",

                    flex: 1,

                    minWidth: 0,

                    height: "100%",
                }}
            >
                {/* -------------------------------------------------------------
                 * Header
                 * ------------------------------------------------------------- */}
                {header && (
                    <header
                        style={{
                            flexShrink: 0,

                            borderBottom:
                                "1px solid rgba(0,0,0,0.08)",

                            background:
                                "var(--dashboard-header-background, white)",
                        }}
                    >
                        {header}
                    </header>
                )}

                {/* -------------------------------------------------------------
                 * Scrollable Main Content
                 * ------------------------------------------------------------- */}
                <main
                    className={contentClassName}
                    style={{
                        flex: 1,

                        overflowY: "auto",

                        padding: "1.5rem",

                        minHeight: 0,

                        ...contentStyle,
                    }}
                >
                    {children}
                </main>

                {/* -------------------------------------------------------------
                 * Footer
                 * ------------------------------------------------------------- */}
                {footer && (
                    <footer
                        style={{
                            flexShrink: 0,

                            borderTop:
                                "1px solid rgba(0,0,0,0.08)",

                            background:
                                "var(--dashboard-footer-background, white)",
                        }}
                    >
                        {footer}
                    </footer>
                )}
            </div>
        </div>
    );
}

DashboardLayout.propTypes = {
    /**
     * Sidebar component/content.
     */
    sidebar: PropTypes.node,

    /**
     * Main page content.
     */
    children: PropTypes.node,

    /**
     * Optional dashboard header.
     */
    header: PropTypes.node,

    /**
     * Optional dashboard footer.
     */
    footer: PropTypes.node,

    /**
     * Sidebar width.
     *
     * Supports:
     *  - number (px)
     *  - string ("20rem", "25%")
     */
    sidebarWidth: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]),

    /**
     * Whether layout should fill viewport height.
     */
    fullHeight: PropTypes.bool,

    /**
     * Additional content area className.
     */
    contentClassName: PropTypes.string,

    /**
     * Inline styles for content area.
     */
    contentStyle: PropTypes.object,

    /**
     * Root className.
     */
    className: PropTypes.string,

    /**
     * Root inline styles.
     */
    style: PropTypes.object,
};
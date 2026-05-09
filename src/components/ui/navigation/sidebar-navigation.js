import React, { useMemo } from "react";
import PropTypes from "prop-types";

import { Collapsible } from "../collapsible";

/**
 * -----------------------------------------------------------------------------
 * SidebarNavigation
 * -----------------------------------------------------------------------------
 *
 * Generic reusable sidebar navigation component.
 *
 * Designed for:
 *  - dashboards
 *  - settings pages
 *  - admin panels
 *  - analytics tools
 *  - documentation navigation
 *
 * -----------------------------------------------------------------------------
 * Features
 * -----------------------------------------------------------------------------
 *
 * - sectioned navigation
 * - collapsible groups
 * - active item highlighting
 * - disabled items
 * - optional icons
 * - badges
 * - configurable widths
 * - scrolling support
 *
 * -----------------------------------------------------------------------------
 * Example
 * -----------------------------------------------------------------------------
 *
 * <SidebarNavigation
 *     activePath={location.pathname}
 *     onNavigate={(item) => navigate(item.href)}
 *     sections={[
 *         {
 *             id: "account",
 *             label: "Account",
 *             collapsible: true,
 *             defaultOpen: true,
 *
 *             items: [
 *                 {
 *                     id: "profile",
 *                     label: "Profile",
 *                     href: "/settings/profile",
 *                 },
 *             ],
 *         },
 *     ]}
 * />
 *
 * -----------------------------------------------------------------------------
 */

const DEFAULT_WIDTH = 280;

export default function SidebarNavigation({
    sections = [],
    activePath = "",
    onNavigate,
    width = DEFAULT_WIDTH,
    className = "",
    style = {},
}) {
    /**
     * -------------------------------------------------------------------------
     * Normalized Sections
     * -------------------------------------------------------------------------
     *
     * Defensive normalization ensures rendering stability even if callers omit
     * optional fields.
     */
    const normalizedSections = useMemo(() => {
        return sections.map((section) => ({
            collapsible: false,
            defaultOpen: true,
            items: [],
            ...section,
        }));
    }, [sections]);

    /**
     * -------------------------------------------------------------------------
     * Handle Navigation
     * -------------------------------------------------------------------------
     */
    const handleNavigate = (item) => {
        if (item.disabled) {
            return;
        }

        onNavigate?.(item);
    };

    /**
     * -------------------------------------------------------------------------
     * Render Navigation Item
     * -------------------------------------------------------------------------
     */
    const renderItem = (item) => {
        const isActive =
            item.href === activePath ||
            item.active === true;

        return (
            <button
                key={item.id || item.href || item.label}
                type="button"
                onClick={() =>
                    handleNavigate(item)
                }
                disabled={item.disabled}
                className={`button is-fullwidth is-justify-content-space-between ${isActive
                        ? "is-info"
                        : "is-light"
                    }`}
                style={{
                    marginBottom: "0.5rem",
                    justifyContent: "space-between",
                    fontWeight: isActive
                        ? 600
                        : 400,
                    opacity:
                        item.disabled
                            ? 0.6
                            : 1,
                }}
            >
                <span
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                    }}
                >
                    {/* Optional Icon */}
                    {item.icon && (
                        <span>
                            <item.icon
                                size={16}
                            />
                        </span>
                    )}

                    <span>
                        {item.label}
                    </span>
                </span>

                {/* Optional Badge */}
                {item.badge != null && (
                    <span className="tag is-info is-light">
                        {item.badge}
                    </span>
                )}
            </button>
        );
    };

    /**
     * -------------------------------------------------------------------------
     * Render Section
     * -------------------------------------------------------------------------
     */
    const renderSection = (section) => {
        const content = (
            <div>
                {section.items.map(
                    renderItem
                )}
            </div>
        );

        /**
         * Collapsible Sections
         */
        if (
            section.collapsible
        ) {
            return (
                <Collapsible
                    key={
                        section.id ||
                        section.label
                    }
                    label={
                        section.label
                    }
                    defaultOpen={
                        section.defaultOpen
                    }
                >
                    {content}
                </Collapsible>
            );
        }

        /**
         * Static Sections
         */
        return (
            <div
                key={
                    section.id ||
                    section.label
                }
                className="mb-4"
            >
                <h4
                    className="title is-6"
                    style={{
                        marginBottom:
                            "0.75rem",
                    }}
                >
                    {
                        section.label
                    }
                </h4>

                {content}
            </div>
        );
    };

    return (
        <aside
            className={`box ${className}`}
            style={{
                width,
                minWidth: width,
                maxWidth: width,

                height: "100%",

                overflowY: "auto",

                padding: "1rem",

                ...style,
            }}
        >
            {normalizedSections.map(
                renderSection
            )}
        </aside>
    );
}

SidebarNavigation.propTypes = {
    /**
     * Navigation sections configuration.
     */
    sections: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string,

            label:
                PropTypes.string
                    .isRequired,

            collapsible:
                PropTypes.bool,

            defaultOpen:
                PropTypes.bool,

            items:
                PropTypes.arrayOf(
                    PropTypes.shape({
                        id:
                            PropTypes.string,

                        label:
                            PropTypes.string
                                .isRequired,

                        href:
                            PropTypes.string,

                        disabled:
                            PropTypes.bool,

                        active:
                            PropTypes.bool,

                        badge:
                            PropTypes.oneOfType(
                                [
                                    PropTypes.string,
                                    PropTypes.number,
                                ]
                            ),

                        icon:
                            PropTypes.elementType,
                    })
                ),
        })
    ),

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
     * Sidebar width.
     */
    width:
        PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
        ]),

    /**
     * Optional className.
     */
    className:
        PropTypes.string,

    /**
     * Optional style overrides.
     */
    style:
        PropTypes.object,
};
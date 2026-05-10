import React, { useMemo } from "react";
import PropTypes from "prop-types";
import logger from "../../../logger";

/**
 * -----------------------------------------------------------------------------
 * Panel
 * -----------------------------------------------------------------------------
 *
 * Generic Bulma Panel wrapper component.
 *
 * Goal:
 *  - abstract Bulma panel markup into reusable React API
 *  - support searchable/filterable dashboards
 *  - support future integrations with:
 *      - Tabs
 *      - SidebarNavigation
 *      - Admin dashboards
 *      - Settings menus
 *
 * -----------------------------------------------------------------------------
 * Features
 * -----------------------------------------------------------------------------
 *
 * - Header title
 * - Optional search input
 * - Optional panel tabs
 * - Configurable panel items
 * - Active item support
 * - Icons
 * - Footer actions
 * - Checkbox blocks
 * - Custom content blocks
 * - Fully controlled component
 *
 * -----------------------------------------------------------------------------
 * Example
 * -----------------------------------------------------------------------------
 *
 * <Panel
 *     heading="Repositories"
 *     searchValue={search}
 *     onSearchChange={setSearch}
 *     tabs={[
 *         { key: "all", label: "All" },
 *         { key: "private", label: "Private" },
 *     ]}
 *     activeTab="all"
 *     onTabChange={setActiveTab}
 *     items={[
 *         {
 *             key: "repo1",
 *             label: "bulma",
 *             icon: <i className="fas fa-book" />,
 *             active: true,
 *         },
 *     ]}
 *     onItemClick={(item) => console.log(item)}
 * />
 *
 * -----------------------------------------------------------------------------
 */

export default function Panel({
    heading,

    /**
     * -------------------------------------------------------------------------
     * Search
     * -------------------------------------------------------------------------
     */
    searchable = false,
    searchPlaceholder = "Search",
    searchValue = "",
    onSearchChange,

    /**
     * -------------------------------------------------------------------------
     * Tabs
     * -------------------------------------------------------------------------
     */
    tabs = [],
    activeTab = null,
    onTabChange,

    /**
     * -------------------------------------------------------------------------
     * Items
     * -------------------------------------------------------------------------
     */
    items = [],
    onItemClick,

    /**
     * -------------------------------------------------------------------------
     * Footer
     * -------------------------------------------------------------------------
     */
    footer = null,

    /**
     * -------------------------------------------------------------------------
     * Optional custom blocks
     * -------------------------------------------------------------------------
     */
    children,
}) {
    /**
     * -------------------------------------------------------------------------
     * Debugging
     * -------------------------------------------------------------------------
     */
    logger.debug("[Panel] render", {
        heading,
        tabsCount: tabs.length,
        itemsCount: items.length,
        searchable,
    });

    /**
     * -------------------------------------------------------------------------
     * Filtered Items
     * -------------------------------------------------------------------------
     *
     * Optional internal filtering if search is enabled.
     *
     * NOTE:
     * In larger apps you may prefer server-side filtering.
     */
    const filteredItems = useMemo(() => {
        if (!searchable || !searchValue) {
            return items;
        }

        const lowered = searchValue.toLowerCase();

        return items.filter((item) =>
            item.label?.toLowerCase().includes(lowered)
        );
    }, [items, searchable, searchValue]);

    return (
        <nav className="panel">

            {/* -----------------------------------------------------------------
                Heading
            ----------------------------------------------------------------- */}
            {heading && (
                <p className="panel-heading">
                    {heading}
                </p>
            )}

            {/* -----------------------------------------------------------------
                Search
            ----------------------------------------------------------------- */}
            {searchable && (
                <div className="panel-block">
                    <p className="control has-icons-left">
                        <input
                            className="input"
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchValue}
                            onChange={(e) =>
                                onSearchChange?.(e.target.value)
                            }
                        />

                        <span className="icon is-left">
                            <i
                                className="fas fa-search"
                                aria-hidden="true"
                            />
                        </span>
                    </p>
                </div>
            )}

            {/* -----------------------------------------------------------------
                Tabs
            ----------------------------------------------------------------- */}
            {tabs.length > 0 && (
                <p className="panel-tabs">
                    {tabs.map((tab) => {
                        const isActive =
                            tab.key === activeTab;

                        return (
                            <a
                                key={tab.key}
                                className={
                                    isActive
                                        ? "is-active"
                                        : ""
                                }
                                onClick={() =>
                                    onTabChange?.(tab.key)
                                }
                                style={{
                                    cursor: "pointer",
                                }}
                            >
                                {tab.label}
                            </a>
                        );
                    })}
                </p>
            )}

            {/* -----------------------------------------------------------------
                Items
            ----------------------------------------------------------------- */}
            {filteredItems.map((item) => {

                /**
                 * -------------------------------------------------------------
                 * Checkbox Item
                 * -------------------------------------------------------------
                 */
                if (item.type === "checkbox") {
                    return (
                        <label
                            key={item.key}
                            className="panel-block"
                        >
                            <input
                                type="checkbox"
                                checked={!!item.checked}
                                onChange={(e) =>
                                    item.onChange?.(
                                        e.target.checked
                                    )
                                }
                                style={{
                                    marginRight: "0.5rem",
                                }}
                            />

                            {item.label}
                        </label>
                    );
                }

                /**
                 * -------------------------------------------------------------
                 * Custom Content Item
                 * -------------------------------------------------------------
                 */
                if (item.type === "custom") {
                    return (
                        <div
                            className="panel-block"
                            style={{ width: "100%" }}
                        >
                            <div style={{ flex: 1 }}>
                                {item.content}
                            </div>
                        </div>
                    );
                }

                /**
                 * -------------------------------------------------------------
                 * Standard Clickable Item
                 * -------------------------------------------------------------
                 */
                return (
                    <a
                        key={item.key}
                        className={`panel-block ${item.active
                            ? "is-active"
                            : ""
                            }`}
                        onClick={() =>
                            onItemClick?.(item)
                        }
                        style={{
                            cursor: "pointer",
                        }}
                    >
                        {item.icon && (
                            <span className="panel-icon">
                                {item.icon}
                            </span>
                        )}

                        {item.label}
                    </a>
                );
            })}

            {/* -----------------------------------------------------------------
                Custom Children
            ----------------------------------------------------------------- */}
            {children}

            {/* -----------------------------------------------------------------
                Footer
            ----------------------------------------------------------------- */}
            {footer && (
                <div className="panel-block">
                    {footer}
                </div>
            )}
        </nav>
    );
}

Panel.propTypes = {
    /**
     * Panel heading/title
     */
    heading: PropTypes.string,

    /**
     * Search
     */
    searchable: PropTypes.bool,
    searchPlaceholder: PropTypes.string,
    searchValue: PropTypes.string,
    onSearchChange: PropTypes.func,

    /**
     * Panel tabs
     */
    tabs: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
        })
    ),

    activeTab: PropTypes.string,
    onTabChange: PropTypes.func,

    /**
     * Panel items
     */
    items: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
            label: PropTypes.string,

            /**
             * Types:
             *  - default clickable item
             *  - checkbox
             *  - custom
             */
            type: PropTypes.oneOf([
                "default",
                "checkbox",
                "custom",
            ]),

            active: PropTypes.bool,
            checked: PropTypes.bool,

            icon: PropTypes.node,
            content: PropTypes.node,

            onChange: PropTypes.func,
        })
    ),

    onItemClick: PropTypes.func,

    /**
     * Footer content
     */
    footer: PropTypes.node,

    /**
     * Optional custom blocks
     */
    children: PropTypes.node,
};
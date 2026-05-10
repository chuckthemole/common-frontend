import React from "react";
import PropTypes from "prop-types";
import logger from "../../../logger";

/**
 * -----------------------------------------------------------------------------
 * Tabs
 * -----------------------------------------------------------------------------
 *
 * Generic tab UI component.
 *
 * Features:
 *  - horizontal or vertical layout
 *  - controlled state (activeTab is external)
 *  - stateless rendering of tab config
 *  - reusable across admin, settings, dashboards, etc.
 *
 * -----------------------------------------------------------------------------
 */

export default function Tabs({
    tabs = [],
    activeTab,
    onChange,
    size,
    alignment,
    layout = "horizontal", // "horizontal" | "vertical"
    variant = "is-boxed", // Bulma-style extension point
}) {
    const isVertical = layout === "vertical";

    logger.debug(
        "[Tabs] debug:",
        tabs.map(tab => ({
            key: tab.key,
            hasComponent: !!tab.component,
            componentType: typeof tab.component
        }))
    );

    return (
        <div
            style={{
                display: isVertical ? "flex" : "block",
                gap: isVertical ? "1rem" : undefined,
            }}
        >
            {/* -----------------------------------------------------------------
                Tab List
            ----------------------------------------------------------------- */}
            <div className={`tabs ${variant} ${size} ${isVertical ? "is-vertical" : ""}`}>
                <ul>
                    {tabs.map((tab) => {
                        const isActive = tab.key === activeTab;

                        return (
                            <li key={tab.key} className={isActive ? "is-active" : ""}>
                                <a
                                    onClick={() => onChange?.(tab.key)}
                                    style={{ cursor: "pointer" }}
                                >
                                    {tab.icon && <span style={{ marginRight: 6 }}>{tab.icon}</span>}
                                    <span>{tab.label}</span>
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* -----------------------------------------------------------------
                Tab Panel
            ----------------------------------------------------------------- */}
            <div style={{ flex: 1 }}>
                {tabs.find((t) => t.key === activeTab)?.component || null}
            </div>
        </div>
    );
}

Tabs.propTypes = {
    tabs: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            component: PropTypes.node,
            icon: PropTypes.node,
        })
    ).isRequired,
    activeTab: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    layout: PropTypes.oneOf(["horizontal", "vertical"]),
    variant: PropTypes.oneOf(["is-boxed", "is-toggle", "is-toggle-rounded"]),
    size: PropTypes.oneOf(["is-small", "is-medium", "is-large"]),
    alignment: PropTypes.oneOf(["is-centered", "is-right"]),
};
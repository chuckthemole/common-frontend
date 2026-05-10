import React, { useState, useCallback } from "react";
import { Tabs } from "../../../ui";
import logger from "../../../../logger";

/**
 * -----------------------------------------------------------------------------
 * AdminUserDashboard
 * -----------------------------------------------------------------------------
 *
 * This is now a PURE orchestration component.
 *
 * Responsibilities:
 *  - holds active tab state
 *  - receives tab configuration from client
 *  - passes config to Tabs UI primitive
 *
 * This makes it reusable for:
 *  - admin dashboards
 *  - user dashboards
 *  - multi-tenant dashboards
 * -----------------------------------------------------------------------------
 */

export default function AdminUserDashboard({
    tabs = [],
    initialTab,
    layout = "horizontal",
    variant = "is-boxed",
}) {

    logger.debug(
        "[AdminUserDashboard] debug:",
        tabs.map(tab => ({
            key: tab.key,
            hasComponent: !!tab.component,
            componentType: typeof tab.component
        }))
    );

    const defaultTab = initialTab || tabs?.[0]?.key || null;

    const [activeTab, setActiveTab] = useState(defaultTab);

    /**
     * Handle tab switching
     */
    const handleTabChange = useCallback((key) => {
        logger.debug(`[AdminUserDashboard] switching tab -> ${key}`);
        setActiveTab(key);
    }, []);

    /**
     * If tabs change dynamically, ensure activeTab stays valid
     */
    React.useEffect(() => {
        if (!tabs.find((t) => t.key === activeTab)) {
            setActiveTab(defaultTab);
        }
    }, [tabs, activeTab, defaultTab]);

    return (
        <div className="box">
            <Tabs
                tabs={tabs}
                activeTab={activeTab}
                onChange={handleTabChange}
                layout={layout}
                variant={variant}
            />
        </div>
    );
}
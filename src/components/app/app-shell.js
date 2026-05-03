import React, { useEffect, useRef, useState, useMemo } from "react";
import { Outlet } from "react-router-dom";

import Header from "../header";
import Footer from "../footer";
import { useLayoutSettings } from "../design-control";
import logger from "../../logger";

/**
 * AppShell
 * -----------------------------------------------------------------------------
 * Pure layout layer:
 * - renders global UI structure (header, footer, content)
 * - consumes layout settings only
 * - does NOT own providers or app-wide state
 */
export default function AppShell({
    headerPath = "/view/header",
    footerPath = "/view/footer",
}) {
    const appRef = useRef(null);
    const [appElement, setAppElement] = useState(null);

    const { layout } = useLayoutSettings();

    /**
     * Capture DOM element once mounted
     */
    useEffect(() => {
        if (!appRef.current) {
            logger.debug("[AppShell] appRef not ready");
            return;
        }

        logger.debug("[AppShell] setting app element");
        setAppElement(appRef.current);
    }, []);

    /**
     * Memoize layout class to avoid recalculation on unrelated renders
     */
    const layoutClass = useMemo(() => {
        return `column ${layout?.columnWidth ?? "is-8"}`;
    }, [layout]);

    return (
        <div ref={appRef} className="app-container">
            {/* Header (global navigation / branding) */}
            <Header header_path={headerPath} />

            {/* Main application area */}
            <main className="app-content columns is-centered">
                <div className="column" />

                <div className={layoutClass}>
                    <Outlet context={{ appElement }} />
                </div>

                <div className="column" />
            </main>

            {/* Footer */}
            <Footer footer_path={footerPath} />
        </div>
    );
}
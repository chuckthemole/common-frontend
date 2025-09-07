const React = require("react");
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRadiation } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import useSWR from "swr";

import { getApi } from "../api";
import { common_fetcher } from "./common_requests";
import { renderBrand, renderNavbarItems } from "./header_helpers";
import logger from "../logger";

/**
 * Normalize navbar items
 *
 * Accepts either:
 *  - Array of config objects (passed to renderNavbarItems)
 *  - Array of React elements (rendered directly)
 */
function normalizeNavbarItems(items) {
    if (!items) return [];

    return items.map((item) => {
        if (React.isValidElement(item)) {
            logger.debug("Rendering React element directly:", item);
            return item;
        } else {
            logger.debug("Rendering item via renderNavbarItems:", item);
            return renderNavbarItems([item]);
        }
    }).flat();
}

/**
 * Header component
 *
 * Renders a responsive navigation header with items pulled from an API,
 * while allowing clients to extend with their own items (start/end).
 *
 * Props:
 *  - header_path: API endpoint path to fetch header config
 *  - navbarItemsStart: optional array of items (same format as API) to append to start
 *  - navbarItemsEnd: optional array of items (same format as API) to append to end
 */
export default function Header({ header_path, navbarItemsStart = [], navbarItemsEnd = [] }) {
    const { data, error } = useSWR(header_path, common_fetcher);
    const api = getApi();

    // Debug: log fetch status
    if (error) logger.error("Header fetch error:", error);
    if (!data) logger.debug("Header loading...");
    if (data) logger.debug("Header data fetched:", data);

    // Default navbar brand shown while waiting for API response
    let navbar_brand = (
        <Link to="/" className="navbar-item">
            <FontAwesomeIcon icon={faRadiation} color="red" />
        </Link>
    );

    // Containers for navbar items
    let navbar_items_start = [];
    let navbar_items_end = [];

    if (data) {
        // --- Navbar brand from API ---
        navbar_brand = renderBrand(data.navbarBrand);

        // --- Navbar items from API ---
        navbar_items_start = renderNavbarItems(data.navbarItemsStart || []);
        navbar_items_end = renderNavbarItems(data.navbarItemsEnd || []);

        // Debug: log rendered API items
        logger.debug("Rendered API navbarItemsStart:", navbar_items_start);
        logger.debug("Rendered API navbarItemsEnd:", navbar_items_end);
    }

    // Append client-provided items
    if (navbarItemsStart.length > 0) {
        const extraStart = normalizeNavbarItems(navbarItemsStart);
        logger.debug("Appending client navbarItemsStart:", extraStart);
        navbar_items_start = [...navbar_items_start, ...extraStart];
    }

    if (navbarItemsEnd.length > 0) {
        const extraEnd = normalizeNavbarItems(navbarItemsEnd);
        logger.debug("Appending client navbarItemsEnd:", extraEnd);
        navbar_items_end = [...navbar_items_end, ...extraEnd];
    }

    // Debug: final items to render
    logger.debug("Final navbar_items_start:", navbar_items_start);
    logger.debug("Final navbar_items_end:", navbar_items_end);

    return (
        <nav className="navbar" role="navigation" aria-label="main navigation">
            <div className="navbar-brand">
                {navbar_brand}
                <a
                    role="button"
                    className="navbar-burger"
                    aria-label="menu"
                    aria-expanded="false"
                    data-target="navbarBasicExample"
                >
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                </a>
            </div>

            <div id="navbarBasicExample" className="navbar-menu">
                <div className="navbar-start">{navbar_items_start}</div>
                <div className="navbar-end">
                    <div className="navbar-item">
                        <div className="buttons">{navbar_items_end}</div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

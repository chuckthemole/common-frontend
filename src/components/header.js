import React, { useEffect, useState } from "react";

import { useApi } from "./hooks/use_api";
import {
    renderBrand,
    renderNavbarItems,
    transformItemsForBurger,
    renderBurgerLinks
} from "./header_helpers";
import logger from "../logger";

/**
 * Normalize custom navbar items, ensuring proper keys and React elements.
 *
 * @param {Array} items - Array of navbar items
 * @returns {Array} - Flattened array of valid React elements
 */
function normalizeNavbarItems(items) {
    if (!items) return [];
    return items
        .map((item, idx) => {
            if (React.isValidElement(item)) {
                return React.cloneElement(item, { key: item.key || `custom-${idx}` });
            } else {
                return renderNavbarItems([item]);
            }
        })
        .flat();
}

/**
 * Header component with API-driven content, optional scroll hide/show behavior.
 *
 * @param {Object} props
 * @param {string} props.header_path - API path to fetch header data
 * @param {Array} props.navbarItemsStart - Additional items for navbar start
 * @param {Array} props.navbarItemsEnd - Additional items for navbar end
 * @param {boolean} props.disappear_on_down_reappear_on_up - Scroll hide/show toggle
 * @returns {React.JSX.Element}
 */
export default function Header({
    header_path,
    navbarItemsStart = [],
    navbarItemsEnd = [],
    disappear_on_down_reappear_on_up = true,
}) {
    const { data, error, loading } = useApi(header_path);

    // State for hiding header on scroll
    const [hidden, setHidden] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);

    // State for burger menu open/close
    const [menuOpen, setMenuOpen] = useState(false);

    /**
     * Scroll handler for hiding/reappearing navbar
     */
    useEffect(() => {
        if (!disappear_on_down_reappear_on_up) return;

        const handleScroll = () => {
            if (window.scrollY > lastScrollY) setHidden(true);
            else setHidden(false);
            setLastScrollY(window.scrollY);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY, disappear_on_down_reappear_on_up]);

    // Logging for API fetch
    if (loading) logger.debug("Header loading...");
    if (error) logger.error("Header fetch error:", error);

    /**
     * Toggle burger menu open/close
     */
    const toggleMenu = () => setMenuOpen(!menuOpen);

    // Default burger element
    let navbar_burger = (
        <button
            role="button"
            className={`navbar-burger ${menuOpen ? "is-active" : ""}`}
            aria-label="menu"
            aria-expanded={menuOpen}
            data-target="navbarBasicExample"
            onClick={toggleMenu}
        >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
        </button>
    );

    // Default brand element (fallback)
    let navbar_brand = renderBrand(null, navbar_burger);

    let navbar_items_start = [];
    let navbar_items_end = [];

    // Populate from API data if available
    if (data) {
        navbar_brand = renderBrand(data.navbarBrand, navbar_burger);
        navbar_items_start = renderNavbarItems(data.navbarItemsStart || []);
        navbar_items_end = renderNavbarItems(data.navbarItemsEnd || []);
    }

    // Append extra custom items
    if (navbarItemsStart.length > 0) {
        navbar_items_start = [...navbar_items_start, ...normalizeNavbarItems(navbarItemsStart)];
    }
    if (navbarItemsEnd.length > 0) {
        navbar_items_end = [...navbar_items_end, ...normalizeNavbarItems(navbarItemsEnd)];
    }

    return (
        <nav
            className={`navbar sticky-header ${hidden ? "hidden" : ""}`}
            role="navigation"
            aria-label="main navigation"
        >
            {navbar_brand}
            <div
                id="navbarBasicExample"
                className={`navbar-menu ${menuOpen ? "is-active" : ""}`}
            >
                <div className="navbar-start">
                    {navbar_items_start}
                </div>
                <div className="navbar-end">
                    {navbar_items_end}
                </div>
            </div>
        </nav>
    );
}

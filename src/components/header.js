const React = require("react");
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRadiation } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import useSWR from "swr";

import { getApi } from "../api";
import { common_fetcher } from "./common_requests";
import { renderBrand, renderNavbarItems } from "./header_helpers";
import logger from "../logger";

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

export default function Header({
    header_path,
    navbarItemsStart = [],
    navbarItemsEnd = [],
    disappear_on_down_reappear_on_up = true,
}) {
    const { data, error } = useSWR(header_path, common_fetcher);
    const api = getApi();

    const [hidden, setHidden] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);

    // Handle hide-on-scroll only if prop is enabled
    useEffect(() => {
        if (!disappear_on_down_reappear_on_up) return;

        const handleScroll = () => {
            if (window.scrollY > lastScrollY) {
                setHidden(true); // scrolling down → hide
            } else {
                setHidden(false); // scrolling up → show
            }
            setLastScrollY(window.scrollY);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY, disappear_on_down_reappear_on_up]);

    if (error) logger.error("Header fetch error:", error);
    if (!data) logger.debug("Header loading...");
    if (data) logger.debug("Header data fetched:", data);

    let navbar_burger = (
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
    );

    let navbar_brand = (
        <Link to="/" className="navbar-brand">
            <FontAwesomeIcon icon={faRadiation} color="red" />
            {navbar_burger}
        </Link>
    );

    let navbar_items_start = [];
    let navbar_items_end = [];

    if (data) {
        navbar_brand = renderBrand(data.navbarBrand, navbar_burger);
        navbar_items_start = renderNavbarItems(data.navbarItemsStart || []);
        navbar_items_end = renderNavbarItems(data.navbarItemsEnd || []);
    }

    if (navbarItemsStart.length > 0) {
        const extraStart = normalizeNavbarItems(navbarItemsStart);
        navbar_items_start = [...navbar_items_start, ...extraStart];
    }

    if (navbarItemsEnd.length > 0) {
        const extraEnd = normalizeNavbarItems(navbarItemsEnd);
        navbar_items_end = [...navbar_items_end, ...extraEnd];
    }

    return (
        <nav
            className={`navbar sticky-header ${hidden ? "hidden" : ""}`}
            role="navigation"
            aria-label="main navigation"
        >
            {navbar_brand}
            <div id="navbarBasicExample" className="navbar-menu">
                <div className="navbar-start">{navbar_items_start}</div>
                <div className="navbar-end">
                    <div className="navbar-item no-hover">
                        <div className="buttons">{navbar_items_end}</div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

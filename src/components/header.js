const React = require('react');
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRadiation } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import { getApi } from '../api';
import { common_fetcher } from './common_requests';
import { renderBrand, renderNavbarItems } from './header_helpers';

export default function Header({ header_path }) {
    const { data, error } = useSWR(header_path, common_fetcher);
    const api = getApi(); // axios instance pointing to backend

    if (error) console.error('Header fetch error:', error);
    if (!data) console.log('Header loading...');

    // Default navbar brand if no data yet
    let navbar_brand = (
        <Link to="/" className="navbar-item">
            <FontAwesomeIcon icon={faRadiation} color="red" />
        </Link>
    );

    let navbar_items_start = [];
    let navbar_items_end = [];

    if (data) {
        // --- Navbar brand ---
        navbar_brand = renderBrand(data.navbarBrand);

        // --- Navbar items start ---
        navbar_items_start = renderNavbarItems(data.navbarItemsStart || []);

        // --- Navbar items end ---
        navbar_items_end = renderNavbarItems(data.navbarItemsEnd || []);
    }

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

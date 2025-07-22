const React = require('react');
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRadiation } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import ReactComponent from './react_component';
import { common_fetcher } from './common_requests';
import AwsGetResource from './aws_get_resource';

export default function Header({ header_path }) {
    const { data, error } = useSWR(header_path, common_fetcher);

    if (error) console.log('Header fetch error:', error);
    if (!data) console.log('Header loading...');

    let navbar_brand = (
        <Link to="/" className="navbar-item">
            <FontAwesomeIcon icon={faRadiation} color="red" />
        </Link>
    );

    let navbar_items_start = [];
    let navbar_items_end = [];

    if (data) {
        // Navbar brand
        const brand = data.navbarBrand;
        if (brand && brand.itemType) {
            if (brand.itemType === 'BRAND') {
                navbar_brand = (
                    <Link to={brand.href} className="navbar-item">
                        <img src={brand.image} width="112" height="28" />
                    </Link>
                );
            } else if (brand.itemType === 'AWS_S3_CLOUD_IMAGE') {
                navbar_brand = (
                    <Link to={brand.href} className="navbar-item">
                        <AwsGetResource
                            resource_key={brand.image}
                            aws_properties_path="/cloud/aws_s3_bucket_properties"
                        />
                    </Link>
                );
            }
        }

        // Navbar items start
        (data.navbarItemsStart || []).forEach((item, i) => {
            if (item.itemType === 'LINK') {
                navbar_items_start.push(
                    <Link key={`start-link-${item.name}-${i}`} to={item.href} className="navbar-item">
                        {item.name}
                    </Link>
                );
            } else if (item.itemType === 'DROPDOWN' && item.dropdown?.length > 0) {
                const dropdown_items = item.dropdown.map((dropItem, j) => {
                    if (dropItem.itemType === 'LINK') {
                        return (
                            <Link
                                key={`start-dropdown-${item.name}-${dropItem.name}-${j}`}
                                to={dropItem.href}
                                className="navbar-item"
                            >
                                {dropItem.name}
                            </Link>
                        );
                    } else if (dropItem.itemType === 'DROPDOWN_DIVIDER') {
                        return (
                            <hr
                                key={`start-divider-${item.name}-${j}`}
                                className="navbar-divider"
                            />
                        );
                    }
                    return null;
                });

                navbar_items_start.push(
                    <div key={`start-dropdown-${item.name}-${i}`} className="navbar-item has-dropdown is-hoverable">
                        <a className="navbar-link">{item.name}</a>
                        <div className="navbar-dropdown">{dropdown_items}</div>
                    </div>
                );
            }
        });

        // Navbar items end
        (data.navbarItemsEnd || []).forEach((item, i) => {
            if (item.itemType === 'LINK') {
                navbar_items_end.push(
                    <Link key={`end-link-${item.name}-${i}`} to={item.href} className="navbar-item">
                        {item.name}
                    </Link>
                );
            } else if (item.itemType === 'DROPDOWN' && item.dropdown?.length > 0) {
                const dropdown_items = item.dropdown.map((dropItem, j) => {
                    if (dropItem.itemType === 'LINK') {
                        return (
                            <Link
                                key={`end-dropdown-${item.name}-${dropItem.name}-${j}`}
                                to={dropItem.href}
                                className="navbar-item"
                            >
                                {dropItem.name}
                            </Link>
                        );
                    }
                    return null;
                });

                navbar_items_end.push(
                    <div key={`end-dropdown-${item.name}-${i}`} className="navbar-item has-dropdown is-hoverable">
                        <a className="navbar-link">{item.name}</a>
                        <div className="navbar-dropdown">{dropdown_items}</div>
                    </div>
                );
            } else if (item.itemType === 'REACT_COMPONENT') {
                navbar_items_end.push(
                    <ReactComponent
                        key={`end-component-${item.name}-${i}`}
                        component_name={item.reactComponent}
                        className="navbar-item"
                    />
                );
            }
        });
    }

    return (
        <nav className="navbar" role="navigation" aria-label="main navigation">
            <div className="navbar-brand">
                {navbar_brand}
                <a role="button" className="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
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

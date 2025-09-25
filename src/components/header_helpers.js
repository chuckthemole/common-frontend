import { getApi } from '../api';
import AwsGetResource from './aws_get_resource';
import DynamicComponent from './dynamic_component';
import React from 'react';
import logger from '../logger';
import { Link } from 'react-router-dom';
import { normalizeUrl } from '../utils/utils';

/**
 * Build a fully-qualified backend URL for assets and links.
 *
 * Ensures all href/src attributes are prefixed with the backend API's baseURL,
 * avoiding broken links when relative paths are returned by the API.
 * 
 * TODO: this seems like it should be in a common lib.
 *
 * @param {string} path - The relative or absolute path provided by the API.
 * @returns {string} - Fully-qualified backend URL.
 */
export const backendHref = (path) => {
    const api = getApi();
    if (!path) return '/';

    const baseURL = api?.defaults?.baseURL || '';
    return `${baseURL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
};

/**
 * Resolve a given path into a usable URL.
 * - If it's already an absolute URL (http/https), return as-is.
 * - Otherwise, run it through backendHref().
 *
 * @param {string} path - The input path or URL
 * @returns {string} - A fully qualified URL
 */
export function resolveResourcePath(path) {
    if (!path) return '';

    const isAbsolute = /^https?:\/\//i.test(path);
    return isAbsolute ? path : backendHref(path);
}

/**
 * Render the "brand" section of the navbar (usually logo + optional burger).
 *
 * Handles multiple brand item types returned by the API:
 *   - BRAND: Standard logo image with link
 *   - AWS_S3_CLOUD_IMAGE: Logo/image retrieved via an AWS S3 resource component
 *   - Default: Fallback "Brand" text
 *
 * @param {Object} brand - Brand configuration object from the API.
 * @param {ReactNode|null} navbar_burger - Optional burger menu element.
 * @returns {JSX.Element} - Rendered brand JSX.
 */
export function renderBrand(brand, navbar_burger = null) {
    const BurgerWrapper = navbar_burger ? (
        <div className="navbar-burger-wrapper">{navbar_burger}</div>
    ) : null;

    if (!brand) {
        return (
            <div className="navbar-brand">
                <a className="navbar-item">Brand</a>
                {BurgerWrapper}
            </div>
        );
    }

    switch (brand.itemType) {
        case 'BRAND':
            const image_path = resolveResourcePath(brand.image);
            return (
                <>
                    <a href={brand.href} className="navbar-brand">
                        <img src={image_path} alt="Brand" />
                    </a>
                    {BurgerWrapper}
                </>
            );

        case 'AWS_S3_CLOUD_IMAGE':
            return (
                <>
                    <a href={brand.href} className="navbar-brand">
                        <AwsGetResource
                            resource_key={brand.image}
                            aws_properties_path="/cloud/aws_s3_bucket_properties"
                        />
                    </a>
                    {BurgerWrapper}
                </>
            );

        default:
            return (
                <>
                    <a className="navbar-brand">Brand</a>
                    {BurgerWrapper}
                </>
            );
    }
}

/**
 * Render a single dropdown menu inside the navbar.
 *
 * Supports:
 *   - LINK: Standard links inside the dropdown
 *   - DROPDOWN_DIVIDER: Horizontal divider between dropdown sections
 *
 * @param {Object} item - Dropdown configuration object from the API.
 * @param {number} idx - Unique index for React key.
 * @returns {JSX.Element|null} - Rendered dropdown JSX or null if empty.
 */
export function renderDropdown(item, idx) {
    if (!item.dropdown?.length) return null;

    return (
        <div
            key={`dropdown-${item.title}-${idx}`}
            className="navbar-item-dropdown has-dropdown is-hoverable"
        >
            {/* Dropdown title */}
            <Link className="navbar-link" to="#">
                {item.title}
            </Link>

            <div className="navbar-dropdown">
                {item.dropdown.map((dropItem, j) => {
                    if (dropItem.itemType === 'LINK') {
                        return (
                            <Link
                                key={`dropdown-link-${dropItem.title}-${j}`}
                                to={normalizeUrl(dropItem.href)}
                                className="navbar-item-link"
                            >
                                {dropItem.title}
                            </Link>
                        );
                    } else if (dropItem.itemType === 'DROPDOWN_DIVIDER') {
                        return (
                            <hr
                                key={`dropdown-divider-${j}`}
                                className="navbar-divider"
                            />
                        );
                    }
                    return null;
                })}
            </div>
        </div>
    );
}

/**
 * Render an array of navbar items based on item type.
 *
 * Supported types:
 *   - LINK: Standard anchor tag
 *   - DROPDOWN: Nested menu, rendered via renderDropdown()
 *   - REACT_COMPONENT: Dynamically injects a React component by name
 *
 * @param {Array<Object>} items - Array of navbar item configurations.
 * @returns {Array<JSX.Element|null>} - Array of rendered React elements.
 */
export function renderNavbarItems(items) {
    logger.debug('debugging item: ', items);
    return items.map((item, i) => {
        switch (item.itemType) {
            case 'LINK':
                return (
                    <Link
                        key={`link-${item.title}-${i}`}
                        to={item.href}
                        className="navbar-item-link"
                    >
                        {item.title}
                    </Link>
                );
            case 'DROPDOWN':
                return renderDropdown(item, i);
            case 'REACT_COMPONENT':
                return (
                    <div
                        key={`component-${item.title}-${i}`}
                        className='navbar-item'
                    // className="navbar-item" TODO: this should probably be a navbar-item. we maybe not have too much css for navbar-items, and just nest the styled elements. think about. -chuck
                    >
                        <DynamicComponent
                            component_name={item.reactComponent}
                            componentProps={item.componentProps || {}}
                        />
                    </div>
                );
            default:
                logger.warn('Unknown navbar item type:', item.itemType);
                return null;
        }
    });
}

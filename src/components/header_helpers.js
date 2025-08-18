import { getApi } from '../api';
import AwsGetResource from './aws_get_resource';
import ReactComponent from './react_component';
import React from 'react';
import logger from '../logger';

// Prepend backend URL
export const backendHref = (path) => {
    const api = getApi();
    if (!path) return '/';
    const baseURL = api?.defaults?.baseURL || '';
    return `${baseURL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
};

// Render the navbar brand
export function renderBrand(brand) {
    if (!brand) return <a className="navbar-item">Brand</a>;

    switch (brand.itemType) {
        case 'BRAND':
            return (
                <a href={backendHref(brand.href)} className="navbar-item" style={{ display: 'flex', alignItems: 'stretch', height: '100%', padding: 0 }}>
                    <img
                        src={backendHref(brand.image)}
                        alt="Brand"
                        style={{ height: '100%', width: 'auto', objectFit: 'contain', display: 'block' }}
                    />
                </a>
            );
        case 'AWS_S3_CLOUD_IMAGE':
            return <a href={backendHref(brand.href)} className="navbar-item">
                <AwsGetResource resource_key={brand.image} aws_properties_path="/cloud/aws_s3_bucket_properties" />
            </a>;
        default:
            return <a className="navbar-item">Brand</a>;
    }
}

// Render a dropdown
export function renderDropdown(item) {
    if (!item.dropdown?.length) {
        // console.log("dropdown is empty!");
        return null;
    }


    logger.debug('lets give this a test');

    // console.log("dropdown not empty, rendering...");
    // console.log(item);

    return (
        <div className="navbar-item has-dropdown is-hoverable">
            <a className="navbar-link">{item.title}</a>
            <div className="navbar-dropdown">
                {item.dropdown.map((dropItem, j) => {
                    if (dropItem.itemType === 'LINK') {
                        return (
                            <a key={`dropdown-link-${dropItem.title}-${j}`} href={backendHref(dropItem.href)} className="navbar-item">
                                {dropItem.title}
                            </a>
                        );
                    } else if (dropItem.itemType === 'DROPDOWN_DIVIDER') {
                        return <hr key={`dropdown-divider-${j}`} className="navbar-divider" />;
                    }
                    return null;
                })}
            </div>
        </div>
    );
}

// Render array of navbar items
export function renderNavbarItems(items) {
    return items.map((item, i) => {
        switch (item.itemType) {
            case 'LINK':
                return <a key={`link-${item.name}-${i}`} href={backendHref(item.href)} className="navbar-item">{item.name}</a>;
            case 'DROPDOWN':
                return <React.Fragment key={`dropdown-${item.name}-${i}`}>{renderDropdown(item)}</React.Fragment>;
            case 'REACT_COMPONENT':
                return <ReactComponent key={`component-${item.name}-${i}`} component_name={item.reactComponent} className="navbar-item" />;
            default:
                return null;
        }
    });
}

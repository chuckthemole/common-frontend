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
            return (
                <>
                    <a href={backendHref(brand.href)} className="navbar-brand">
                        <img src={backendHref(brand.image)} alt="Brand" />
                    </a>
                    {BurgerWrapper}
                </>
            );

        case 'AWS_S3_CLOUD_IMAGE':
            return (
                <>
                    <a href={backendHref(brand.href)} className="navbar-brand">
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

// Render a dropdown
export function renderDropdown(item, idx) {
    if (!item.dropdown?.length) return null;

    return (
        <div key={`dropdown-${item.title}-${idx}`} className="navbar-item has-dropdown is-hoverable">
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
                return <a key={`link-${item.title}-${i}`} href={backendHref(item.href)} className="navbar-item">{item.title}</a>;
            case 'DROPDOWN':
                return renderDropdown(item, i);
            case 'REACT_COMPONENT':
                return <ReactComponent key={`component-${item.title}-${i}`} component_name={item.reactComponent} className="navbar-item" />;
            default:
                return null;
        }
    });
}

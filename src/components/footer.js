import React, { useEffect, useState } from 'react';
import { useApi } from './hooks/use_api';
import logger from '../logger';

/**
 * Footer component that fetches and displays footer content from the API.
 *
 * @param {Object} props
 * @param {string} props.footer_path - API path to fetch footer data
 * @returns {React.JSX.Element}
 */
export default function Footer({ footer_path }) {
    const { data, error, loading } = useApi(footer_path);

    if (loading) {
        logger.debug('Footer loading...');
        return renderLoading();
    }

    if (error) {
        logger.error('Footer fetch error:', error);
        return renderError(error.message || 'Failed to load footer');
    }

    if (!data?.columns || !Array.isArray(data.columns)) {
        logger.warn('Footer data invalid:', data);
        return renderError('Invalid footer data structure.');
    }

    return (
        <div className="columns is-centered has-text-centered">
            <div className="column is-half">
                <div className="columns is-centered">
                    {data.columns.map(({ items, title }) => (
                        <div className="column" key={title}>
                            <div className="footer-title">{title}</div>
                            {Array.isArray(items) &&
                                items.map((item, idx) => (
                                    <div key={`${item}-${idx}`}>
                                        <span>{item}</span>
                                    </div>
                                ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

/**
 * Renders an error state for the footer.
 *
 * @param {string} [message="An error occurred with footer"] - Optional error message
 * @returns {React.JSX.Element}
 */
function renderError(message = 'An error occurred with footer') {
    return (
        <div className="columns is-centered has-text-centered">
            <div className="column is-half notification is-warning">
                <p>{message}</p>
            </div>
        </div>
    );
}

/**
 * Renders a loading state for the footer.
 *
 * @returns {React.JSX.Element}
 */
function renderLoading() {
    return (
        <div className="container m-6">
            <progress className="progress is-small is-primary" max="100">
                15%
            </progress>
            <progress className="progress is-danger" max="100">
                30%
            </progress>
            <progress className="progress is-medium is-dark" max="100">
                45%
            </progress>
            <progress className="progress is-large is-info" max="100">
                60%
            </progress>
        </div>
    );
}

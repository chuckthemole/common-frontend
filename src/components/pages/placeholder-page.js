import React from "react";

/**
 * -----------------------------------------------------------------------------
 * Placeholder Route Components
 * -----------------------------------------------------------------------------
 *
 * Temporary scaffold pages used until full implementations exist.
 * Replace with real feature pages over time.
 *
 * -----------------------------------------------------------------------------
 */

export default function PlaceholderPage({
    title,
    description = "This page is currently under construction.",
}) {
    return (
        <div className="box">
            <h1 className="title is-4">
                {title}
            </h1>

            <p className="has-text-grey">
                {description}
            </p>
        </div>
    );
}
import React from "react";

import { RequireAuth } from "../../auth";

/**
 * -----------------------------------------------------------------------------
 * createRouteElement
 * -----------------------------------------------------------------------------
 *
 * Creates a standardized route element component.
 *
 * Supports:
 * - auth wrapping
 * - layout wrapping
 * - future permissions
 * - future feature flags
 *
 * -----------------------------------------------------------------------------
 */
export function createRouteElement(
    Component,
    {
        requireAuth = false,
    } = {}
) {

    function RouteElement(props) {

        const content =
            <Component {...props} />;

        if (requireAuth) {
            return (
                <RequireAuth>
                    {content}
                </RequireAuth>
            );
        }

        return content;
    }

    RouteElement.displayName =
        `RouteElement(${Component.displayName || Component.name || "Anonymous"})`;

    return RouteElement;
}
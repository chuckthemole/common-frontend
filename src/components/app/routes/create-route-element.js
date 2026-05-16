import React from "react";

import { RequireAuth } from "../../auth";

/**
 * -----------------------------------------------------------------------------
 * createRouteElement
 * -----------------------------------------------------------------------------
 *
 * Creates a standardized route component wrapper for application routes.
 *
 * Features:
 * - optional authentication guards
 * - configurable component props
 * - centralized route composition
 * - extensible for future permissions, layouts, and feature flags
 *
 * Example:
 *
 * security:
 *     createRouteElement(
 *         SecurityPage,
 *         {
 *             componentProps: {
 *                 mode: "advanced",
 *                 allowPasswordReset: true,
 *             },
 *         }
 *     )
 *
 * -----------------------------------------------------------------------------
 */
export function createRouteElement(
    Component,
    {
        requireAuth = false,
        componentProps = {},
    } = {}
) {

    function RouteElement(props) {

        const content = (
            <Component
                {...componentProps}
                {...props}
            />
        );

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
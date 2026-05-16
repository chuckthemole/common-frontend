import React from "react";

import { normalizeRoutePath } from "../../../utils";

/**
 * -----------------------------------------------------------------------------
 * buildRoutesFromNavigation
 * -----------------------------------------------------------------------------
 *
 * Converts nested navigation configuration into flat React Router route objects.
 *
 * Example:
 *
 * navigation:
 * [
 *   {
 *     items: [
 *       {
 *         id: "profile",
 *         href: "/home/profile",
 *       }
 *     ]
 *   }
 * ]
 *
 * registry:
 * {
 *   profile: ProfilePage
 * }
 *
 * output:
 * [
 *   {
 *     path: "profile",
 *     element: <ProfilePage />
 *   }
 * ]
 *
 * -----------------------------------------------------------------------------
 *
 * @param {Array} navigation
 * Nested navigation configuration.
 *
 * @param {Object} routeRegistry
 * Map of route IDs -> React components.
 *
 * @param {Object} options
 *
 * @param {string} options.basePath
 * Base path to strip from href.
 * Example: "/home"
 *
 * @param {boolean} options.warnMissing
 * Whether to warn for missing route registry entries.
 *
 * @returns {Array}
 * React Router route definitions.
 *
 * -----------------------------------------------------------------------------
 */
export function buildRoutesFromNavigation(
    navigation = [],
    routeRegistry = {},
    {
        basePath = "",
        warnMissing = true,
    } = {}
) {

    const INDEX = "index";
    const flatRoutes = [];

    if (routeRegistry[INDEX]) {
        const Index = routeRegistry[INDEX];
        flatRoutes.push({
            index: true,
            element: <Index />,
        });
    }

    /**
     * -------------------------------------------------------------------------
     * Normalize Base Path
     * -------------------------------------------------------------------------
     */
    const normalizedBase =
        normalizeRoutePath(basePath);

    /**
     * -------------------------------------------------------------------------
     * Flatten Navigation
     * -------------------------------------------------------------------------
     */
    for (const section of navigation) {

        const items = section?.items || [];

        for (const item of items) {

            const key = item?.id;

            const Element =
                routeRegistry[key];

            /**
             * Skip missing elements
             */
            if (!Element) {

                if (warnMissing) {
                    console.warn(
                        `[routes] missing route element for "${key}"`
                    );
                }

                continue;
            }

            /**
             * Normalize href
             */
            const normalizedHref =
                normalizeRoutePath(item.href);

            /**
             * Strip base path
             */
            let relativePath =
                normalizedHref;

            if (
                normalizedBase &&
                normalizedHref.startsWith(normalizedBase)
            ) {
                relativePath =
                    normalizedHref.slice(
                        normalizedBase.length
                    );
            }

            /**
             * Remove leading slash
             */
            relativePath =
                relativePath.replace(/^\/+/, "");

            flatRoutes.push({
                path: relativePath,
                element: <Element />,
            });
        }
    }

    return flatRoutes;
}
// utils/component_debugger.js

/**
 * Utility to validate and log the status of imported React components.
 *
 * This is helpful when diagnosing "Element type is invalid" errors caused by:
 * - Missing or incorrect imports (component is undefined)
 * - Wrong export type (e.g. imported a non-component value)
 *
 * Logs results through the shared logger so that output is consistent across environments.
 *
 * Usage example:
 *   import { debugComponents } from "../utils/component_debugger";
 *   import { Button, Slider } from "@rumpushub/common-react";
 *
 *   debugComponents({ Button, Slider }, "MyDashboard");
 *
 * Example log output:
 *   [MyDashboard] Loaded: Button
 *   [MyDashboard] Component "Slider" is undefined!
 */

import logger from "../logger.js";

/**
 * Logs the status of each provided component.
 *
 * @param {Record<string, any>} components - Map of component names to values.
 * @param {string} [sourceName="Unknown"] - Identifier for where this check is run (e.g. dashboard name).
 */
export function debugComponents(components, sourceName = "Unknown") {
    Object.entries(components).forEach(([name, comp]) => {
        if (!comp) {
            // Component is not defined → likely an import/export mismatch.
            logger.error(`[${sourceName}] Component "${name}" is undefined!`);
        } else if (typeof comp === "function" || typeof comp === "object") {
            // Looks like a valid React component (function/class or forwardRef object).
            logger.debug(`[${sourceName}] Loaded: ${name}`);
        } else {
            // Component exists but isn't a function or object (probably wrong import).
            logger.warn(
                `[${sourceName}] "${name}" is not a valid React component type (typeof = ${typeof comp}).`
            );
        }
    });
}

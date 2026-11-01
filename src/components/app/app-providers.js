
import React, { useEffect, useRef, useState } from "react";
import { PROVIDER_REGISTRY } from "./provider-registry";
import logger from "../../logger";

/**
 * Determines whether a provider is enabled.
 *
 * Supports:
 *   true
 *   { enabled: true }
 *
 * @param {*} providerConfig
 * @param {string} providerName
 * @returns {boolean}
 */
function isProviderEnabled(providerConfig, providerName) {
    let enabled = false;

    if (typeof providerConfig === "boolean") {
        enabled = providerConfig;
    } else if (
        providerConfig !== null &&
        typeof providerConfig === "object"
    ) {
        enabled = providerConfig.enabled === true;
    }

    logger.debug(
        `[AppProviders] Provider "${providerName}" enabled:`,
        enabled,
        "Config:",
        providerConfig
    );

    return enabled;
}

/**
 * Composes providers based on configuration.
 *
 * Providers are collected in registry order and rendered
 * using reduceRight so the first provider becomes the
 * outermost provider.
 *
 * @param {Object} config
 * @param {React.ReactNode} children
 * @param {Object} contextProps
 * @returns {React.ReactNode}
 */
function composeProviders(config, children, contextProps) {
    logger.debug("[AppProviders] Starting provider composition.");

    const activeProviders = [];

    if (!config || typeof config !== "object" || Array.isArray(config)) {
        logger.error(
            "[AppProviders] Invalid configuration supplied:",
            config
        );

        return children;
    }

    logger.debug(
        "[AppProviders] Available configuration keys:",
        Object.keys(config)
    );

    Object.keys(config).forEach((key) => {
        const providerConfig = config[key];
        const registryEntry = PROVIDER_REGISTRY[key];

        logger.debug(
            `[AppProviders] Inspecting provider "${key}".`,
            {
                providerConfig,
                registryEntryExists: Boolean(registryEntry),
            }
        );

        const enabled = isProviderEnabled(providerConfig, key);

        if (!enabled) {
            logger.debug(
                `[AppProviders] Skipping disabled provider "${key}".`
            );
            return;
        }

        if (!registryEntry) {
            logger.warn(
                `[AppProviders] Provider "${key}" is enabled but has no registry entry.`
            );
            return;
        }

        if (!Array.isArray(registryEntry)) {
            logger.error(
                `[AppProviders] Registry entry for "${key}" must be an array.`,
                registryEntry
            );
            return;
        }

        logger.debug(
            `[AppProviders] Activating provider group "${key}".`,
            {
                providerCount: registryEntry.length,
            }
        );

        registryEntry.forEach((Provider, index) => {
            if (typeof Provider !== "function") {
                logger.error(
                    `[AppProviders] Invalid provider at "${key}" index ${index}.`,
                    Provider
                );
                return;
            }

            activeProviders.push({
                Provider,
                group: key,
                index,
            });

            logger.debug(
                `[AppProviders] Registered provider "${key}" at index ${index}.`
            );
        });
    });

    logger.debug(
        "[AppProviders] Provider collection complete.",
        {
            activeProviderCount: activeProviders.length,
            providerOrder: activeProviders.map(
                ({ group, index }) => `${group}[${index}]`
            ),
        }
    );

    return activeProviders.reduceRight((acc, entry, position) => {
        const { Provider, group, index } = entry;

        logger.debug(
            `[AppProviders] Composing provider "${group}" index ${index}.`,
            {
                compositionPosition: position,
            }
        );

        try {
            return (
                <Provider
                    key={`${group}-${index}`}
                    config={config}
                    {...contextProps}
                >
                    {acc}
                </Provider>
            );
        } catch (error) {
            logger.error(
                `[AppProviders] Error composing provider "${group}" index ${index}.`,
                error
            );

            throw error;
        }
    }, children);
}

/**
 * AppProviders
 *
 * Root provider composition component.
 */
export default function AppProviders({ config = {}, children }) {
    const appRef = useRef(null);
    const [appElement, setAppElement] = useState(null);

    logger.debug("[AppProviders] Rendering AppProviders.", {
        config,
        hasChildren: Boolean(children),
        hasAppElement: Boolean(appElement),
    });

    useEffect(() => {
        logger.debug("[AppProviders] Mount effect executed.");

        if (appRef.current) {
            logger.debug(
                "[AppProviders] App element successfully initialized.",
                appRef.current
            );

            setAppElement(appRef.current);
        } else {
            logger.warn(
                "[AppProviders] App element ref is not available."
            );
        }

        return () => {
            logger.debug("[AppProviders] AppProviders unmounting.");
        };
    }, []);

    logger.debug(
        "[AppProviders] Composing providers with appElement:",
        appElement
    );

    return (
        <div ref={appRef}>
            {composeProviders(
                config,
                children,
                { appElement }
            )}
        </div>
    );
}

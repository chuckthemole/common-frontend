import React, { useEffect, useRef, useState } from "react";
import { PROVIDER_REGISTRY } from "./provider-registry";
import logger from "../../logger";

/**
 * Composes providers based on config
 */
function composeProviders(config, children, contextProps) {
    const activeProviders = [];

    Object.keys(config).forEach((key) => {
        if (config[key] && PROVIDER_REGISTRY[key]) {
            activeProviders.push(...PROVIDER_REGISTRY[key]);
        }
    });

    return activeProviders.reduceRight((acc, Provider, i) => {
        if (!Provider) {
            logger.error("Undefined provider at index", i);
            return acc;
        }

        return Provider({
            children: acc,
            config,
            ...contextProps,
        });
    }, children);
}

/**
 * AppProviders
 */
export default function AppProviders({ config = {}, children }) {
    const appRef = useRef(null);
    const [appElement, setAppElement] = useState(null);

    useEffect(() => {
        if (appRef.current) {
            setAppElement(appRef.current);
        }
    }, []);

    return (
        <div ref={appRef}>
            {composeProviders(config, children, { appElement })}
        </div>
    );
}
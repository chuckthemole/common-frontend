import React, { Suspense, lazy, Component } from 'react';
import logger from '../logger';
import { ErrorIndicator } from './ui';

// Lazy import wrapper with logging
const lazyWithLogging = (importFunc, name) =>
    lazy(() =>
        importFunc().catch(err => {
            logger.error(`Failed to load "${name}":`, err);
            throw err; // re-throw so React knows it failed
        })
    );

// Lazy component mapping
const COMPONENT_MAP = {

    // Triggers
    LoginTrigger: lazyWithLogging(
        () => import('./triggers/login_trigger'),
        'LoginTrigger'
    ),
    SignupTrigger: lazyWithLogging(
        () => import('./triggers/signup_trigger'),
        'SignupTrigger'
    ),

    // Depreciate maybe
    SignupModal: lazyWithLogging(
        () => import('./modal/signup_modal'),
        'SignupModal'
    ),
    LoginModal: lazyWithLogging(
        () => import('./modal/login_modal'),
        'LoginModal'
    ),
    Logout: lazyWithLogging(
        () => import('./ui/buttons/logout_button'),
        'Logout'
    ),
    UserIcon: lazyWithLogging(
        () => import('./user_icon'),
        'UserIcon'
    ),
    Admin: lazyWithLogging(
        () => import('./ui/buttons/admin_button'),
        'Admin'
    ),
};

// Required props for validation
const REQUIRED_PROPS = {
    LoginTrigger: ['mode', 'triggerType', 'triggerLabel'],
    SignupTrigger: ['mode', 'triggerType', 'triggerLabel'],
    SignupModal: ['redirectTo'],
    Logout: ['redirectTo'],
};

// Error boundary for catching rendering errors
class ComponentErrorBoundary extends Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        logger.error('DynamicComponent rendering error:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <ErrorIndicator
                    copyable
                    message={`Error rendering component: ${this.state.error?.message}`}
                />
            );
        }
        return this.props.children;
    }
}

export default function DynamicComponent({ component_name, componentProps = {} }) {
    logger.debug("DynamicComponent invoked", {
        component_name,
        componentProps,
    });

    const Component = COMPONENT_MAP[component_name];

    if (!Component) {
        logger.warn("DynamicComponent: component not found", {
            component_name,
            available: Object.keys(COMPONENT_MAP),
        });

        return (
            <div style={{ color: "red" }}>
                Component not found: {component_name}
            </div>
        );
    }

    logger.debug("DynamicComponent: resolved component", {
        component_name,
        Component,
    });

    // Check required props
    const required = REQUIRED_PROPS[component_name] || [];
    const missingProps = required.filter(p => !(p in componentProps));

    if (missingProps.length > 0) {
        logger.warn("DynamicComponent: missing required props", {
            component_name,
            missingProps,
            providedProps: Object.keys(componentProps),
            componentProps,
        });

        return (
            <ErrorIndicator
                copyable
                message={
                    `Missing props for ${component_name}: ${missingProps.join(", ")}`
                    + <br /> +
                    `Current props: ${JSON.stringify(componentProps)}`}
            />
        );
    }

    logger.debug("DynamicComponent: props validated", {
        component_name,
        componentProps,
    });

    let element;
    try {
        element = <Component {...componentProps} />;
        logger.debug("DynamicComponent: element created successfully", {
            component_name,
        });
    } catch (err) {
        logger.error("DynamicComponent: synchronous render error", err, {
            component_name,
            componentProps,
        });

        return (
            <div style={{ color: "red" }}>
                Error creating component: {err.message}
            </div>
        );
    }

    return (
        <ComponentErrorBoundary>
            <Suspense
                fallback={
                    (() => {
                        logger.debug("DynamicComponent: Suspense fallback shown", {
                            component_name,
                        });
                        return null;
                    })()
                }
            >
                {element}
            </Suspense>
        </ComponentErrorBoundary>
    );
}

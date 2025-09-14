import React, { Suspense, lazy, Component } from 'react';
import logger from '../logger';

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
    SignupModal: lazyWithLogging(() => import('./modal/signup_modal'), 'SignupModal'),
    LoginModal: lazyWithLogging(() => import('./modal/login_modal'), 'LoginModal'),
    Logout: lazyWithLogging(() => import('./ui/logout_button'), 'Logout'),
    UserIcon: lazyWithLogging(() => import('./user_icon'), 'UserIcon'),
    Admin: lazyWithLogging(() => import('./ui/admin_button'), 'Admin'),
};

// Required props for validation
const REQUIRED_PROPS = {
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
                <div style={{ color: 'red' }}>
                    Error rendering component: {this.state.error?.message}
                </div>
            );
        }
        return this.props.children;
    }
}

export default function DynamicComponent({ component_name, componentProps = {} }) {
    const Component = COMPONENT_MAP[component_name];

    if (!Component) {
        logger.warn(`DynamicComponent: No component found for "${component_name}"`);
        return (
            <div style={{ color: 'red' }}>
                Component not found: {component_name}
            </div>
        );
    }

    // Check required props
    const missingProps = (REQUIRED_PROPS[component_name] || []).filter(
        (p) => !(p in componentProps)
    );

    if (missingProps.length > 0) {
        logger.warn(
            `DynamicComponent: Missing required props for ${component_name}:`,
            missingProps,
            'Current props:',
            componentProps
        );
        return (
            <div style={{ color: 'red' }}>
                Missing props for {component_name}: {missingProps.join(', ')} <br />
                Current props: {JSON.stringify(componentProps)}
            </div>
        );
    }

    // Debugging: log which component is being rendered and its props
    logger.debug(`DynamicComponent rendering "${component_name}" with props:`, componentProps);

    return (
        <ComponentErrorBoundary>
            <Suspense fallback={<></>}>
                <Component {...componentProps} />
            </Suspense>
        </ComponentErrorBoundary>
    );
}

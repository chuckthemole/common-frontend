import consola from 'consola';
import { useMemo } from 'react';

/**
 * Supported environments for logging.
 */
const LoggingEnv = {
    DEVELOPMENT: 'development',
    STAGING: 'staging',
    PRODUCTION: 'production',
};

/**
 * Supported log levels (numeric values from consola).
 * Lower numbers = higher severity
 */
const LogLevel = {
    FATAL: 1,
    ERROR: 2,
    WARN: 3,
    LOG: 4,
    INFO: 5,
    DEBUG: 6,
    TRACE: 7,
};

// Default environment
let currentEnv = LoggingEnv.DEVELOPMENT;

// Map environment names to default log levels
const EnvLogLevelMap = {
    [LoggingEnv.PRODUCTION]: LogLevel.WARN,     // Show WARN and above
    [LoggingEnv.STAGING]: LogLevel.INFO,       // Show INFO and above
    [LoggingEnv.DEVELOPMENT]: LogLevel.DEBUG,  // Show DEBUG and above
};

/**
 * Get the current logging environment.
 * @returns {string} Current environment name
 */
export function getLoggingEnv() {
    return currentEnv;
}

/**
 * Set the logging environment and dynamically update the logger level.
 * @param {string} env - One of LoggingEnv values
 */
export function setLoggingEnv(env) {
    if (!Object.values(LoggingEnv).includes(env)) {
        throw new Error(`Invalid logging environment: ${env}`);
    }
    currentEnv = env;
    logger.level = EnvLogLevelMap[currentEnv];

    // Optional: toggle colors for production
    // logger._setFormatOptions({
    //     colors: currentEnv !== LoggingEnv.PRODUCTION,
    // });
}

/**
 * Create a consola logger instance with dynamic level control
 */
const logger = consola.create({
    level: EnvLogLevelMap[currentEnv],
    formatOptions: {
        colors: currentEnv !== LoggingEnv.PRODUCTION,
        showFunctionName: true,
        showFilePath: true,
    },
});

// -------------------------------
// Add group / groupEnd support
// -------------------------------

/**
 * Start a log group. Falls back to info if console.group is not supported
 */
logger.group = (...args) => {
    if (typeof console.group === 'function') {
        console.group(...args);
    } else {
        logger.info(...args);
    }
};

/**
 * End the current log group
 */
logger.groupEnd = () => {
    if (typeof console.groupEnd === 'function') {
        console.groupEnd();
    }
};

/**
 * Start a collapsed log group. Falls back to info if unsupported
 */
logger.groupCollapsed = (...args) => {
    if (typeof console.groupCollapsed === 'function') {
        console.groupCollapsed(...args);
    } else {
        logger.info(...args);
    }
};

/**
 * Create a scoped logger instance.
 * Uses consola's withTag under the hood.
 *
 * @param {string} scope
 * @returns {object} scoped logger
 */
logger.withScope = (scope) => {
    const scoped = logger.withTag(scope);

    // Re-attach group helpers so they still work
    scoped.group = (...args) => {
        if (typeof console.group === 'function') {
            console.group(`[${scope}]`, ...args);
        } else {
            scoped.info(...args);
        }
    };

    scoped.groupCollapsed = (...args) => {
        if (typeof console.groupCollapsed === 'function') {
            console.groupCollapsed(`[${scope}]`, ...args);
        } else {
            scoped.info(...args);
        }
    };

    scoped.groupEnd = () => {
        if (typeof console.groupEnd === 'function') {
            console.groupEnd();
        }
    };

    return scoped;
};

/**
 * React hook to get a stable scoped logger
 *
 * @param {string} scope
 * @param {object} customLogger
 */
export function useScopedLogger(scope, customLogger = logger) {
    if (!customLogger) {
        throw new Error(
            `[useLogger] Missing logger instance for scope: "${scope}"`
        );
    }

    return useMemo(() => {
        if (typeof customLogger.withScope !== "function") {
            throw new Error(
                `[useLogger] Provided logger does not support withScope() for scope: "${scope}"`
            );
        }

        return customLogger.withScope(scope);
    }, [scope, customLogger]);
}

/**
 * createScopedLogger
 * -----------------------------------------------------------------------------
 * Pure (non-React) factory for creating scoped logger instances.
 *
 * This is safe to use in:
 *  - services (singletons, APIs, event systems)
 *  - React components (outside hooks)
 *  - module-level constants
 *
 * Unlike useScopedLogger, this does NOT depend on React lifecycle.
 *
 * @param {string} scope - Logical context label (e.g. "EventLogger")
 * @param {object} baseLogger - Optional logger instance (defaults to main logger)
 * @returns {object} scoped logger instance
 */
export function createScopedLogger(scope, baseLogger = logger) {
    if (!scope || typeof scope !== "string") {
        throw new Error("[createScopedLogger] scope must be a non-empty string");
    }

    if (!baseLogger || typeof baseLogger.withTag !== "function") {
        throw new Error(
            `[createScopedLogger] Invalid logger provided for scope "${scope}"`
        );
    }

    // Create base scoped logger using consola tagging system
    const scoped = baseLogger.withTag(scope);

    /**
     * Optional: enhance console grouping so scope is always visible
     * and consistent across grouped logs.
     */
    scoped.group = (...args) => {
        if (typeof console.group === "function") {
            console.group(`[${scope}]`, ...args);
        } else {
            scoped.info(...args);
        }
    };

    scoped.groupCollapsed = (...args) => {
        if (typeof console.groupCollapsed === "function") {
            console.groupCollapsed(`[${scope}]`, ...args);
        } else {
            scoped.info(...args);
        }
    };

    scoped.groupEnd = () => {
        if (typeof console.groupEnd === "function") {
            console.groupEnd();
        }
    };

    /**
     * Optional enhancement: attach metadata for debugging tools
     */
    scoped.__scope = scope;

    return scoped;
}

/**
 * Export logger instance and helper enums for convenience.
 */
export default logger;
export { LoggingEnv, LogLevel };

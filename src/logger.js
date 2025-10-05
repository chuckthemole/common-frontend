import consola from 'consola';

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
 * Export logger instance and helper enums for convenience.
 */
export default logger;
export { LoggingEnv, LogLevel };

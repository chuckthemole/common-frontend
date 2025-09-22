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
 * Supported log levels (consola numeric values).
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
 * @returns {string} Current environment name.
 */
export function getLoggingEnv() {
    return currentEnv;
}

/**
 * Set the logging environment and update the logger level dynamically.
 * @param {string} env - One of LoggingEnv values.
 */
export function setLoggingEnv(env) {
    if (!Object.values(LoggingEnv).includes(env)) {
        throw new Error(`Invalid logging environment: ${env}`);
    }
    currentEnv = env;
    logger.level = EnvLogLevelMap[currentEnv];
    // TODO: look into
    // logger._setFormatOptions({
    //     colors: currentEnv !== LoggingEnv.PRODUCTION,
    // });

}

/**
 * Create a consola logger instance with dynamic level control.
 */
const logger = consola.create({
    level: EnvLogLevelMap[currentEnv],
    formatOptions: {
        colors: currentEnv !== LoggingEnv.PRODUCTION,
        showFunctionName: true,
        showFilePath: true,
    },
});

/**
 * Export logger instance and helper enums for convenience.
 */
export default logger;
export { LoggingEnv, LogLevel };

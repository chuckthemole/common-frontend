import consola from 'consola';

let currentEnv = 'development'; // default to dev

export function setEnv(env) {
    currentEnv = env;
}

export function getEnv() {
    return currentEnv;
}

// Map environment to log level numbers
function getLogLevel(env) {
    switch (env) {
        case 'production':
            return 2; // warn and above
        case 'staging':
            return 4; // info and above
        default:
            return 6; // debug and above
    }
}

const level = getLogLevel(currentEnv);

// Create a wrapper instance
const logger = consola.create({
    level,
    formatOptions: {
        colors: currentEnv !== 'production',
        showFunctionName: true,
        showFilePath: true,
    },
});

export default logger;

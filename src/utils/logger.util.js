// src/utils/logger.util.js (Frontend version)

const isDevelopment = import.meta.env.MODE === 'development';

const log = (level, ...args) => {
    if (!isDevelopment && level === 'debug') { // Don't log debug in production
        return;
    }
    const timestamp = new Date().toISOString();
    const prefix = `[FE][${level.toUpperCase()}] ${timestamp}:`;

    switch (level) {
        case 'error':
            console.error(prefix, ...args);
            break;
        case 'warn':
            console.warn(prefix, ...args);
            break;
        case 'info':
            console.info(prefix, ...args);
            break;
        case 'debug':
            console.debug(prefix, ...args); // console.debug might not show in all browser consoles by default
            break;
        default:
            console.log(prefix, ...args);
    }
};

const logger = {
    debug: (...args) => log('debug', ...args),
    info: (...args) => log('info', ...args),
    warn: (...args) => log('warn', ...args),
    error: (...args) => log('error', ...args),
};

export default logger;
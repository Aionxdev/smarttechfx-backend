// src/utils/helpers.js

/**
 * Helper to construct query parameters for API calls.
 * Removes undefined or null values.
 * @param {object} params - An object of query parameters.
 * @returns {string} - A URL query string (e.g., "?name=test&status=active").
 */
export const buildQueryParams = (params) => {
    if (!params || typeof params !== 'object' || Object.keys(params).length === 0) {
        return '';
    }
    const searchParams = new URLSearchParams();
    for (const key in params) {
        if (params[key] !== undefined && params[key] !== null && String(params[key]).trim() !== '') {
            searchParams.append(key, params[key]);
        }
    }
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
};

/**
 * Simple function to get a value from an object by a dot-separated path.
 * @param {object} obj - The object to traverse.
 * @param {string} path - The dot-separated path (e.g., 'user.profile.name').
 * @param {any} defaultValue - Value to return if path is not found.
 * @returns {any} - The value at the path or the default value.
 */
export const getObjectValueByPath = (obj, path, defaultValue = undefined) => {
    if (typeof path !== 'string' || !obj || typeof obj !== 'object') {
        return defaultValue;
    }
    const keys = path.split('.');
    let result = obj;
    for (const key of keys) {
        if (result && typeof result === 'object' && key in result) {
            result = result[key];
        } else {
            return defaultValue;
        }
    }
    return result;
};

/**
 * Delays execution for a specified number of milliseconds.
 * @param {number} ms - Milliseconds to delay.
 * @returns {Promise<void>}
 */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


/**
 * Generates a simple unique ID (for client-side use, not a true UUID).
 * Not for cryptographic purposes or database IDs.
 * @returns {string}
 */
export const generateClientSideId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * Scrolls the window to the top.
 * @param {ScrollBehavior} behavior - 'auto' or 'smooth'.
 */
export const scrollToTop = (behavior = 'smooth') => {
    window.scrollTo({
        top: 0,
        behavior: behavior,
    });
};
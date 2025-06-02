// src/utils/formatters.js
import { format, parseISO, formatDistanceToNowStrict, isValid } from 'date-fns';

/**
 * Formats a date string or Date object to a more readable format.
 * @param {string | Date} dateInput - The date to format (ISO string or Date object).
 * @param {string} formatString - The desired format (e.g., 'MMM dd, yyyy HH:mm').
 * @returns {string} - The formatted date string, or 'Invalid Date' on error.
 */

export const formatDate = (dateInput, formatString = 'MMM dd, yyyy p') => {
    console.log("[formatDate] Input received:", dateInput, "| Type:", typeof dateInput);

    if (!dateInput && dateInput !== 0) { // Handle null, undefined, empty string, but allow timestamp 0
        console.warn("[formatDate] Input is falsy (and not zero):", dateInput);
        return 'N/A';
    }

    let date;
    if (typeof dateInput === 'string') {
        if (dateInput.trim() === '') { // Handle empty string after ensuring it's not falsy above
            console.warn("[formatDate] Input is an empty string.");
            return 'N/A';
        }
        date = parseISO(dateInput);
    } else if (dateInput instanceof Date) {
        date = dateInput;
    } else if (typeof dateInput === 'number') { // Could be a timestamp
        date = new Date(dateInput);
    } else {
        console.warn("[formatDate] Received unexpected dateInput type:", typeof dateInput, dateInput);
        return 'Invalid Input Type';
    }

    if (!isValid(date)) {
        console.warn("[formatDate] Input resulted in an invalid date after parsing:",
            `Original Input: ${dateInput}`,
            `Attempted Date Object: ${date}`
        );
        return 'Invalid Date';
    }

    try {
        return format(date, formatString);
    } catch (error) {
        console.error("[formatDate] Error during date-fns format() call:",
            `Original Input: ${dateInput}`,
            `Attempted Date Object: ${date}`,
            error
        );
        return 'Formatting Error';
    }
};

/**
 * Formats a date to show relative time (e.g., "2 hours ago", "3 days ago").
 * @param {string | Date} dateInput - The date to format.
 * @returns {string} - The relative time string.
 */
export const formatTimeAgo = (dateInput) => {
    try {
        const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        return formatDistanceToNowStrict(date, { addSuffix: true });
    } catch (error) {
        console.error("Error formatting time ago:", dateInput, error);
        return 'Invalid Date';
    }
};

/**
 * Formats a number as USD currency.
 * @param {number} amount - The amount to format.
 * @param {number} minimumFractionDigits - Minimum decimal places.
 * @param {number} maximumFractionDigits - Maximum decimal places.
 * @returns {string} - Formatted currency string (e.g., "$1,234.50").
 */
export const formatCurrency = (amount, minimumFractionDigits = 2, maximumFractionDigits = 2) => {
    if (typeof amount !== 'number' || isNaN(amount)) {
        return '$0.00'; // Or some other default/error indicator
    }
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits,
            maximumFractionDigits,
        }).format(amount);
    } catch (error) {
        console.error("Error formatting currency:", amount, error);
        return '$NaN';
    }
};

/**
 * Formats a number as a cryptocurrency amount with appropriate precision.
 * @param {number} amount - The crypto amount.
 * @param {string} symbol - The crypto symbol (e.g., "BTC", "ETH") for precision hints.
 * @param {number} defaultPrecision - Default decimal places if no specific hint.
 * @returns {string} - Formatted crypto amount string.
 */
export const formatCrypto = (amount, symbol = '', defaultPrecision = 8) => {
    if (typeof amount !== 'number' || isNaN(amount)) {
        return '0.00';
    }
    let precision = defaultPrecision;
    const upperSymbol = symbol.toUpperCase();

    if (['USDT', 'USDC', 'DAI'].includes(upperSymbol)) { // Stablecoins
        precision = 2; // Or up to 6 depending on context
    } else if (['BTC'].includes(upperSymbol)) {
        precision = 8;
    } else if (['ETH'].includes(upperSymbol)) {
        precision = 6; // Common display, though can go to 18
    } else if (['XRP', 'DOGE', 'LTC', 'SOL', 'MATIC', 'BNB', 'BCH'].includes(upperSymbol)) {
        precision = Math.min(6, defaultPrecision); // Adjust as needed
    }

    try {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2, // Always show at least 2 for readability
            maximumFractionDigits: precision,
        }).format(amount);
    } catch (error) {
        console.error("Error formatting crypto:", amount, symbol, error);
        return 'NaN';
    }
};

/**
 * Truncates a string to a specified length and adds an ellipsis.
 * @param {string} str - The string to truncate.
 * @param {number} maxLength - The maximum length before truncating.
 * @returns {string} - The truncated string.
 */
export const truncateString = (str, maxLength = 50) => {
    if (typeof str !== 'string') return '';
    if (str.length <= maxLength) {
        return str;
    }
    return str.substring(0, maxLength) + '...';
};

/**
 * Capitalizes the first letter of a string.
 * @param {string} str - The string to capitalize.
 * @returns {string} - The capitalized string.
 */
export const capitalizeFirstLetter = (str) => {
    if (typeof str !== 'string' || str.length === 0) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};


/**
 * Formats total minutes into a more readable "Xh Ym" or "Ym" or "Xh" string.
 * @param {number} totalMinutes - The total minutes to format.
 * @returns {string} - Formatted string like "2h 30m", "45m", "3h".
 */
export const formatMinutesToHoursAndMinutes = (totalMinutes) => {
    if (typeof totalMinutes !== 'number' || isNaN(totalMinutes) || totalMinutes < 0) {
        return "0m"; // Return "0m" for invalid or zero input
    }
    if (totalMinutes === 0) {
        return "0m";
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60); // Round minutes

    let result = "";
    if (hours > 0) {
        result += `${hours}h`;
    }
    if (minutes > 0) {
        if (hours > 0) result += " "; // Add space if hours are also present
        result += `${minutes}m`;
    }

    return result.trim() || "0m"; // Fallback to "0m" if somehow both are zero after logic
};
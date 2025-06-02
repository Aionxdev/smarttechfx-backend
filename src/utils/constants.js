/* This JavaScript file `constants.js` contains various constant values used in a web application. Here
is a summary of what each section is doing: */
// src/utils/constants.js

// Application Name (can also be from .env)
export const APP_NAME = import.meta.env.VITE_APP_NAME;

// url
export const APP_URL = import.meta.env.VITE_FRONTEND_URL

// Jurisdiction
export const JURISDICTION = import.meta.env.VITE_JURISDICTION

// UI States for async operations
export const UI_STATE = Object.freeze({
    IDLE: 'idle',
    LOADING: 'loading',
    SUCCESS: 'success',
    ERROR: 'error',
});

// Common Local Storage Keys
export const LOCAL_STORAGE_KEYS = Object.freeze({
    AUTH_USER: 'stfx_authUser', // Stores basic user info after login
    AUTH_TOKEN_EXPIRY: 'stfx_tokenExpiry', // Could store expiry to proactively refresh
    THEME: 'stfx_theme', // 'light' or 'dark'
    CHAT_HISTORY_PREFIX: 'stfx_chatHistory_', // e.g., stfx_chatHistory_userId
});

// Frontend Route Paths (centralize for easy management and use with react-router-dom Link)
export const ROUTES = Object.freeze({
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password', // Expects /reset-password?token=...
    VERIFY_EMAIL: '/verify-email',   // Expects /verify-email?token=... or for OTP page

    // User Dashboard
    USER_DASHBOARD: '/dashboard',
    USER_PLANS: '/dashboard/plans',
    USER_INVESTMENT_DETAILS: '/dashboard/investments/:investmentId', // Example with param
    USER_WITHDRAW: '/dashboard/withdraw',
    USER_PROFILE: '/dashboard/profile',
    USER_ACTIVITY: '/dashboard/activity',
    USER_NOTIFICATIONS: '/dashboard/notifications',
    USER_HELP_SUPPORT: '/dashboard/help-support', // Help & Support Page

    // Admin Dashboard
    ADMIN_DASHBOARD: '/admin/dashboard',
    ADMIN_USERS: '/admin/users',
    ADMIN_USER_DETAILS: '/admin/users/:userId',
    ADMIN_PLANS: '/admin/plans', // Manage plans
    ADMIN_INVESTMENTS: '/admin/investments',
    ADMIN_WITHDRAWALS: '/admin/withdrawals',
    ADMIN_SETTINGS: '/admin/settings', // Platform settings
    ADMIN_LOGS: '/admin/logs',

    // Other
    TERMS_OF_SERVICE: '/terms',
    PRIVACY_POLICY: '/privacy',
    NOT_FOUND: '/404',
    FAQ: '/faqs',
});

// User Roles (for role-based access control)
export const USER_ROLES = Object.freeze({
    ADMIN: 'Admin',
    INVESTOR: 'Investor',
});

export const CHAT_MESSAGE_ROLES = Object.freeze({ // We'll use 'USER' for messages displayed in widget
    USER: 'USER',
    SYSTEM_INFO: 'SYSTEM_INFO', // For messages like "Your email app should open..."
});


// Investment Statuses (for investment lifecycle management)
export const INVESTMENT_STATUS = Object.freeze({
    PENDING_VERIFICATION: 'PendingVerification',
    ACTIVE: 'Active',
    MATURED: 'Matured',
    WITHDRAWN: 'Withdrawn',
    CANCELLED: 'Cancelled',
});

// Transaction Types (for transaction history and management)
export const TRANSACTION_TYPES = Object.freeze({
    DEPOSIT: 'Deposit',
    WITHDRAWAL: 'Withdrawal',
    ROI_PAYOUT: 'ROIPayout',
    // ... more if added ...
});

// Transaction Statuses (for transaction lifecycle management)
export const TRANSACTION_STATUS = Object.freeze({
    PENDING: 'Pending',
    VERIFIED: 'Verified',
    COMPLETED: 'Completed',
    FAILED: 'Failed',
    REJECTED: 'Rejected',
    CANCELLED: 'Cancelled',
});

// OTP Purposes (for OTP generation and verification)
export const OTP_PURPOSES = Object.freeze({
    EMAIL_VERIFICATION: 'EmailVerification',
    PASSWORD_RESET: 'PasswordReset',
    INVESTMENT_VERIFICATION: 'InvestmentVerification',
});

// Supported Crypto Symbols (can be duplicated from backend constants or fetched)
export const SUPPORTED_CRYPTO_SYMBOLS_FRONTEND = ['BTC', 'ETH', 'USDT', 'SOL', 'MATIC', 'LTC', 'XRP', 'DOGE', 'BNB', 'BCH'];

// Charting constants
export const CHART_COLORS = Object.freeze({
    PRIMARY: '#4A90E2', // Example primary blue
    ACCENT_GREEN: '#50E3C2', // Example accent green
    ACCENT_ORANGE: '#F5A623', // Example accent orange
    TEXT_DARK: '#333333',
    TEXT_LIGHT: '#FFFFFF',
    GRID_DARK: 'rgba(255, 255, 255, 0.1)',
    GRID_LIGHT: 'rgba(0, 0, 0, 0.1)',
});

// Date Formats (for consistent date formatting across the app)
export const DATE_FORMATS = Object.freeze({
    DEFAULT: 'YYYY-MM-DD',
    FULL_DATE: 'MMMM D, YYYY',
    TIME: 'h:mm A',
    DATETIME: 'MMMM D, YYYY h:mm A',
});

// ACCOUNT_STATUS
export const ACCOUNT_STATUS = Object.freeze({
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    SUSPENDED: 'Suspended',
    BANNED: 'Banned',
});

// LOG_EVENT_TYPES
export const LOG_EVENT_TYPES = Object.freeze({
    USER_LOGIN: 'UserLogin',
    USER_LOGOUT: 'UserLogout',
    INVESTMENT_CREATED: 'InvestmentCreated',
    INVESTMENT_UPDATED: 'InvestmentUpdated',
    INVESTMENT_DELETED: 'InvestmentDeleted',
    WITHDRAWAL_REQUESTED: 'WithdrawalRequested',
    WITHDRAWAL_COMPLETED: 'WithdrawalCompleted',
});

// LOG_LEVELS
export const LOG_LEVELS = Object.freeze({
    INFO: 'Info',
    WARNING: 'Warning',
    ERROR: 'Error',
    DEBUG: 'Debug',
});

//  KYC_STATUS
export const KYC_STATUS = Object.freeze({
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
});

// WITHDRAWAL_STATUS
export const WITHDRAWAL_STATUS = Object.freeze({
    PENDING: 'Pending',
    COMPLETED: 'Completed',
    FAILED: 'Failed',
    CANCELLED: 'Cancelled',
});

// INVESTMENT_TYPES
export const INVESTMENT_TYPES = Object.freeze({
    FIXED_DEPOSIT: 'FixedDeposit',
    FLEXIBLE_INVESTMENT: 'FlexibleInvestment',
    CRYPTO_TRADING: 'CryptoTrading',
    FOREX_TRADING: 'ForexTrading',
});

export const SUPPORT_EMAIL_ADDRESS = import.meta.env.VITE_SUPPORT_EMAIL;


// CHAT_MESSAGE_SENDER_TYPE
export const CHAT_MESSAGE_SENDER_TYPE = Object.freeze({
    USER: 'user',
    ASSISTANT: 'assistant', // AI or support agent
    SYSTEM: 'system', // For system messages or notifications
});

// CHAT_MESSAGE_STATUS
export const CHAT_MESSAGE_STATUS = Object.freeze({
    SENT: 'sent',
    DELIVERED: 'delivered',
    READ: 'read',
    FAILED: 'failed',
});
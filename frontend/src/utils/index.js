// Application constants
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/api/auth/access-token',
        REFRESH: '/api/auth/refresh-token',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
    },
    USERS: {
        PROFILE: '/api/profile',
        UPDATE: '/api/profile',
    },
    MENTORS: {
        LIST: '/api/mentors',
        REGISTER: '/mentors/register',
        DASHBOARD: '/mentors/dashboard',
    },
    ADMIN: {
        USERS: '/admin/users',
        CONTENT: '/admin/content',
        ANALYTICS: '/admin/analytics',
    },
};

export const USER_ROLES = {
    ADMIN: 'ADMIN',
    MODERATOR: 'MODERATOR',
    MENTOR: 'MENTOR',
    CUSTOMER: 'CUSTOMER',
};

export const STORAGE_KEYS = {
    AUTH_STATE: 'authState',
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    THEME: 'theme',
};

// Utilities
export * from './storageUtils';
export * from './mentorUtils';
export * from './htmlUtils';
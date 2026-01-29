// ⚠️ DEPRECATED: Token management has been moved to memory + HttpOnly cookies
// This file is kept for backward compatibility and debugging only
// DO NOT use these functions for new code

/**
 * @deprecated Tokens are no longer stored in localStorage for security reasons
 * Clear all authentication-related data from localStorage
 */
export const clearAuthData = () => {
    try {
        // Only clear old token data if it exists (for migration)
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('authState');
        console.log('✅ Old auth data cleared from localStorage');
    } catch (error) {
        console.error('❌ Error clearing auth storage:', error);
    }
};

/**
 * Clear all localStorage data
 */
export const clearAllStorage = () => {
    try {
        localStorage.clear();
        console.log('✅ All localStorage cleared');
    } catch (error) {
        console.error('❌ Error clearing all storage:', error);
    }
};

/**
 * Clear specific keys from localStorage
 * @param {string[]} keys - Array of keys to remove
 */
export const clearStorageKeys = (keys) => {
    try {
        keys.forEach(key => {
            localStorage.removeItem(key);
        });
        console.log('✅ Specific keys cleared:', keys);
    } catch (error) {
        console.error('❌ Error clearing specific keys:', error);
    }
};

/**
 * Get all localStorage keys (for debugging)
 */
export const getAllStorageKeys = () => {
    try {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            keys.push(localStorage.key(i));
        }
        return keys;
    } catch (error) {
        console.error('❌ Error getting storage keys:', error);
        return [];
    }
};

/**
 * Log all localStorage content (for debugging)
 */
export const debugStorage = () => {
    console.group('🔍 LocalStorage Debug');
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            console.log(`${key}:`, value);
        }
    } catch (error) {
        console.error('❌ Error debugging storage:', error);
    }
    console.groupEnd();
};

// Backwards-compatible alias (some modules expect `clearAuthStorage`)
export const clearAuthStorage = clearAuthData;

export default {
    clearAuthStorage,
    clearAllStorage,
    clearStorageKeys,
    getAllStorageKeys,
    debugStorage
};
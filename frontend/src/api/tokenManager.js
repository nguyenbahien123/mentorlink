/**
 * Token Manager - Quản lý accessToken trong bộ nhớ (không localStorage)
 * AccessToken được lưu trong memory, refreshToken trong HttpOnly cookie
 */

let accessToken = null;
let tokenUpdateCallback = null;

export const tokenManager = {
    /**
     * Lấy accessToken hiện tại
     */
    getAccessToken() {
        return accessToken;
    },

    /**
     * Set accessToken mới
     */
    setAccessToken(token) {
        accessToken = token;
        
        // Notify callback (for AuthContext)
        if (tokenUpdateCallback && token) {
            tokenUpdateCallback(token);
        }
    },

    /**
     * Clear accessToken
     */
    clearAccessToken() {
        accessToken = null;
    },

    /**
     * Set callback khi token được update (để sync với AuthContext)
     */
    setTokenUpdateCallback(callback) {
        tokenUpdateCallback = callback;
    }
};

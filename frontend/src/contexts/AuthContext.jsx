import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import AuthService from '../services/auth/AuthService';
import { tokenManager } from '../api/tokenManager';

export const AuthContext = createContext({
    isLoggedIn: false,
    user: null,
    accessToken: null,
    login: () => { },
    logout: () => { },
    refreshToken: () => { },
    setAccessToken: () => { },
});

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        isLoggedIn: false,
        user: null,
        accessToken: null, // Store accessToken in memory
        loading: true
    });

    // Callback to update context when tokenManager updates token
    const handleTokenUpdate = useCallback((token) => {
        if (token) {
            const user = AuthService.decodeToken(token);
            setAuthState(prev => ({
                ...prev,
                accessToken: token,
                user: user,
                isLoggedIn: true
            }));
        }
    }, []);

    // Setup tokenManager callback
    useEffect(() => {
        tokenManager.setTokenUpdateCallback(handleTokenUpdate);
    }, [handleTokenUpdate]);

    // Kiểm tra authentication khi component mount - try silent refresh
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                // Try to refresh token silently on app load
                const result = await AuthService.silentRefresh();
                if (result.success && result.accessToken) {
                    const user = AuthService.decodeToken(result.accessToken);
                    if (user) {
                        tokenManager.setAccessToken(result.accessToken);
                        setAuthState({
                            isLoggedIn: true,
                            user: user,
                            accessToken: result.accessToken,
                            loading: false
                        });
                        return;
                    }
                }
            } catch (error) {
                console.log('Silent refresh failed, user needs to login');
            }
            
            // If silent refresh fails, set logged out state
            setAuthState({
                isLoggedIn: false,
                user: null,
                accessToken: null,
                loading: false
            });
        };

        initializeAuth();
    }, []);

    const login = useCallback(async (email, password) => {
        try {
            const result = await AuthService.login(email, password);
            if (result.success) {
                tokenManager.setAccessToken(result.accessToken);
                setAuthState({
                    isLoggedIn: true,
                    user: result.user,
                    accessToken: result.accessToken,
                    loading: false
                });
                return result;
            } else {
                return result;
            }
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: 'Đăng nhập thất bại'
            };
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await AuthService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
        tokenManager.clearAccessToken();
        setAuthState({
            isLoggedIn: false,
            user: null,
            accessToken: null,
            loading: false
        });
    }, []);

    const refreshToken = useCallback(async () => {
        try {
            const result = await AuthService.refreshToken();
            if (result.success && result.accessToken) {
                const user = AuthService.decodeToken(result.accessToken);
                tokenManager.setAccessToken(result.accessToken);
                setAuthState(prev => ({
                    ...prev,
                    user: user,
                    accessToken: result.accessToken,
                    isLoggedIn: true
                }));
                return result;
            } else {
                logout();
                return result;
            }
        } catch (error) {
            logout();
            return {
                success: false,
                error: 'Refresh token thất bại'
            };
        }
    }, [logout]);

    const setAccessToken = useCallback((token) => {
        if (token) {
            const user = AuthService.decodeToken(token);
            tokenManager.setAccessToken(token);
            setAuthState(prev => ({
                ...prev,
                accessToken: token,
                user: user,
                isLoggedIn: true
            }));
        } else {
            tokenManager.clearAccessToken();
            setAuthState(prev => ({
                ...prev,
                accessToken: null,
                user: null,
                isLoggedIn: false
            }));
        }
    }, []);

    return (
        <AuthContext.Provider value={{
            ...authState,
            login,
            logout,
            refreshToken,
            setAccessToken
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export const isModerator = (roles) => {
    return roles.includes('moderator') || roles.includes('admin');
};
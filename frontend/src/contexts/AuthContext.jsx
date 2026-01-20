import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import AuthService from '../services/auth/AuthService';

export const AuthContext = createContext({
    isLoggedIn: false,
    user: null,
    login: () => { },
    logout: () => { },
    refreshToken: () => { },
});

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        isLoggedIn: false,
        user: null,
        loading: true
    });

    // Kiểm tra authentication khi component mount
    useEffect(() => {
        const initializeAuth = () => {
            try {
                if (AuthService.isAuthenticated()) {
                    const user = AuthService.getCurrentUser();
                    if (user) {
                        setAuthState({
                            isLoggedIn: true,
                            user: user,
                            loading: false
                        });
                    } else {
                        AuthService.logout();
                        setAuthState({
                            isLoggedIn: false,
                            user: null,
                            loading: false
                        });
                    }
                } else {
                    setAuthState({
                        isLoggedIn: false,
                        user: null,
                        loading: false
                    });
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
                AuthService.logout();
                setAuthState({
                    isLoggedIn: false,
                    user: null,
                    loading: false
                });
            }
        };

        initializeAuth();
    }, []);

    const login = useCallback(async (email, password) => {
        try {
            const result = await AuthService.login(email, password);
            if (result.success) {
                setAuthState({
                    isLoggedIn: true,
                    user: result.user,
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

    const logout = useCallback(() => {
        AuthService.logout();
        setAuthState({
            isLoggedIn: false,
            user: null,
            loading: false
        });
    }, []);

    const refreshToken = useCallback(async () => {
        try {
            const result = await AuthService.refreshToken();
            if (result.success) {
                const user = AuthService.getCurrentUser();
                setAuthState(prev => ({
                    ...prev,
                    user: user
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

    return (
        <AuthContext.Provider value={{
            ...authState,
            login,
            logout,
            refreshToken
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export const isModerator = (roles) => {
    return roles.includes('moderator') || roles.includes('admin');
};
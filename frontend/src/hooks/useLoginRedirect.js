import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';
import AuthService from '../services/auth/AuthService';

const useLoginRedirect = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isLoggedIn, user } = useAuth();

    useEffect(() => {
        // Chỉ redirect khi đang ở login page và đã đăng nhập
        if (isLoggedIn && user && location.pathname === '/login') {
            // Kiểm tra nếu có redirect path từ protected route
            const from = location.state?.from?.pathname;

            if (from && from !== '/login') {
                navigate(from, { replace: true });
            } else {
                // Navigate theo role
                const route = AuthService.getRouteByRole(user.role);
                navigate(route, { replace: true });
            }
        }
    }, [isLoggedIn, user, navigate, location.pathname, location.state]);
};

export default useLoginRedirect;
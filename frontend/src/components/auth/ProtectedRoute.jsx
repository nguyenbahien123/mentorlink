import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts';
import { Spinner, Container } from 'react-bootstrap';

const ProtectedRoute = ({ children, requiredRole = null }) => {
    const { isLoggedIn, user, loading } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="text-center">
                    <Spinner animation="border" role="status" className="mb-3">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <div>Đang kiểm tra xác thực...</div>
                </div>
            </Container>
        );
    }

    // Redirect to login if not authenticated
    if (!isLoggedIn || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check role-based access if requiredRole is specified - case insensitive
    if (requiredRole && user.role.toUpperCase() !== requiredRole.toUpperCase()) {
        // Role mismatch - redirect to appropriate page

        // Redirect to appropriate dashboard based on user's role
        const roleRoutes = {
            'CUSTOMER': '/',
            'ADMIN': '/admin',
            'MENTOR': '/mentor/dashboard',
            'MODERATOR': '/moderator'
        };

        const redirectPath = roleRoutes[user.role.toUpperCase()] || '/';
        return <Navigate to={redirectPath} replace />;
    }

    // Access granted - user has correct role
    return children;
};

export default ProtectedRoute;
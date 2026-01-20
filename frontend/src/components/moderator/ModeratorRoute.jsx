import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, isModerator } from '../../contexts';

// Protected route component that checks for moderator role
const ModeratorRoute = ({ children }) => {
    const { isLoggedIn, roles } = useAuth();

    // Check if user is authenticated and has moderator role
    if (!isLoggedIn || !isModerator(roles)) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ModeratorRoute;
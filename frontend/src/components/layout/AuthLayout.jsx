import React from 'react';
import { Container } from 'react-bootstrap';
import '../../styles/components/Layout.css';

const AuthLayout = ({ children }) => {
    return (
        <div className="auth-layout">
            <Container fluid className="h-100">
                <div className="auth-container">
                    {children}
                </div>
            </Container>
        </div>
    );
};

export default AuthLayout;

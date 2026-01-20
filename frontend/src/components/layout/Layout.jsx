import React from 'react';
import { useLocation } from 'react-router-dom';
import { Header, Footer } from '../common';
import { AdminHeader } from '../admin';
import { useAuth } from '../../contexts';
import '../../styles/components/Layout.css';

const Layout = ({ children }) => {
    const location = useLocation();
    const { user } = useAuth();

    // Ẩn header cho khu vực mentor dashboard
    const hideHeader = user?.role === 'MENTOR' && location.pathname.startsWith('/mentor');
    const isAdminRoute = location.pathname.startsWith('/admin');

    return (
        <div className="layout-container">
            {!hideHeader && (isAdminRoute ? <AdminHeader /> : <Header />)}
            <main className="main-content">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
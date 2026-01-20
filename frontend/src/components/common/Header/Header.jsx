import React, { useState } from 'react';
import { Container, Nav, Navbar, NavDropdown, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useTheme } from '../../../contexts';
import { ThemeToggle, ServicesDropdown } from '../';
import '../../../styles/components/Header.css';

const Header = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();

    // Get authentication state from context
    const { isLoggedIn, user } = useAuth();
    const { isDarkMode } = useTheme();

    // Check if user is moderator or admin
    const userIsModerator = user?.role === 'MODERATOR' || user?.role === 'ADMIN';

    const handleLoginClick = () => {
        navigate('/login');
    };

    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="main-header">
            <Navbar expand="lg" className="navbar-dark custom-navbar">
                <Container>
                    <Navbar.Brand as={Link} to="/" className="brand-logo">
                        <span className="brand-text">MentorLink</span>
                    </Navbar.Brand>

                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto align-items-center">
                            <Nav.Link as={Link} to="/about" className="nav-link">Về MentorLink</Nav.Link>
                            <ServicesDropdown />
                            <Nav.Link as={Link} to="/find-mentor" className="nav-link">Tìm Cố vấn</Nav.Link>
                            <Nav.Link as={Link} to="/become-mentor" className="nav-link">Trở thành Cố vấn</Nav.Link>
                            <Nav.Link as={Link} to="/blogs" className="nav-link">Xem Blogs</Nav.Link>
                            <Nav.Link as={Link} to="/faqs" className="nav-link">Xem FAQs</Nav.Link>
                            {isLoggedIn ? (
                                <NavDropdown
                                    title={
                                        <span>
                                            <i className="bi bi-person-circle me-2"></i>
                                            {user?.email || "Tài khoản"}
                                        </span>
                                    }
                                    id="account-dropdown"
                                    className="account-dropdown"
                                    show={showDropdown}
                                    onMouseEnter={() => setShowDropdown(true)}
                                    onMouseLeave={() => setShowDropdown(false)}
                                    align="end"
                                    renderMenuOnMount
                                    popperConfig={{ strategy: 'fixed' }}   // <-- tránh bị che bởi stacking/overflow
                                >
                                    <NavDropdown.Item as={Link} to="/profile">
                                        <i className="bi bi-person me-2"></i>Hồ sơ
                                    </NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/booking-history">
                                        <i className="bi bi-calendar-check me-2"></i>Lịch sử đặt lịch
                                    </NavDropdown.Item>
                                    

                                    {/* Role-based navigation */}
                                    {user?.role === 'ADMIN' && (
                                        <NavDropdown.Item as={Link} to="/admin">
                                            <i className="bi bi-shield-lock me-2"></i>Admin Panel
                                        </NavDropdown.Item>
                                    )}
                                    {user?.role === 'MENTOR' && (
                                        <NavDropdown.Item as={Link} to="/mentor/dashboard">
                                            <i className="bi bi-speedometer2 me-2"></i>Dashboard
                                        </NavDropdown.Item>
                                    )}
                                    {user?.role === 'MODERATOR' && (
                                        <NavDropdown.Item as={Link} to="/moderator">
                                            <i className="bi bi-shield-check me-2"></i>Moderator Panel
                                        </NavDropdown.Item>
                                    )}

                                    <NavDropdown.Divider />
                                    <NavDropdown.Item onClick={handleLogout}>
                                        <i className="bi bi-box-arrow-right me-2"></i>Đăng xuất
                                    </NavDropdown.Item>
                                </NavDropdown>
                            ) : (
                                <NavDropdown
                                    title="Tài khoản"
                                    id="account-dropdown"
                                    className="account-dropdown"
                                    show={showDropdown}
                                    onMouseEnter={() => setShowDropdown(true)}
                                    onMouseLeave={() => setShowDropdown(false)}
                                    align="end"
                                    renderMenuOnMount
                                    popperConfig={{ strategy: 'fixed' }}   // <-- tương tự cho menu khách
                                >
                                    <NavDropdown.Item as={Link} to="/login">Đăng nhập</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/register">Đăng ký</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/register-mentor">Đăng ký làm Cố vấn</NavDropdown.Item>
                                </NavDropdown>
                            )}

                            {userIsModerator && (
                                <Nav.Link as={Link} to="/moderator" className="nav-link ms-2 px-3 border border-light rounded">
                                    <i className="bi bi-shield-check me-1"></i>
                                    Moderator
                                </Nav.Link>
                            )}

                            <div className="ms-3">
                                <ThemeToggle />
                            </div>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </header>
    );
};

export default Header;
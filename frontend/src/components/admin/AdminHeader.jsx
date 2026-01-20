import React, { useState } from "react";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, useTheme } from "../../contexts";
import { ThemeToggle } from "../common";
import "../../styles/components/Header.css";

// A compact header dedicated to the Admin area only
const AdminHeader = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const { isLoggedIn, user, logout } = useAuth();
  const { isDarkMode } = useTheme();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="main-header">
      <Navbar expand="lg" className="navbar-dark custom-navbar">
        <Container>
          <Navbar.Brand as={Link} to="/admin" className="brand-logo">
            <span className="brand-text">MentorLink</span>
          </Navbar.Brand>

          <Nav className="ms-auto align-items-center">
            <span className="nav-link ms-2 px-3 border border-light rounded">
              <i className="bi bi-shield-lock me-1"></i>
              Admin
            </span>

            {isLoggedIn && (
              <NavDropdown
                title={
                  <span>
                    <i className="bi bi-person-circle me-2"></i>
                    {user?.email || "Tài khoản"}
                  </span>
                }
                id="admin-account-dropdown"
                className="account-dropdown"
                show={showDropdown}
                onMouseEnter={() => setShowDropdown(true)}
                onMouseLeave={() => setShowDropdown(false)}
                align="end"
                renderMenuOnMount
                popperConfig={{ strategy: "fixed" }}
              >
                <NavDropdown.Item as={Link} to="/profile">
                  <i className="bi bi-person me-2"></i>Hồ sơ
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i>Đăng xuất
                </NavDropdown.Item>
              </NavDropdown>
            )}

            <div className="ms-3">
              <ThemeToggle />
            </div>
          </Nav>
        </Container>
      </Navbar>
    </header>
  );
};

export default AdminHeader;

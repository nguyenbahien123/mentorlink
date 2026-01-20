import React from "react";
import { Card, Nav, Button } from "react-bootstrap";
import {
  FaUsers,
  FaBlog,
  FaUserCog,
  FaBullhorn,
  FaCog,
} from "react-icons/fa";

const AdminSidebar = ({ menuItems, activeTab }) => {
  return (
    <>
      <Card className="admin-sidebar">
        <Card.Body className="p-0">
          <div className="sidebar-header">
            <h6 className="mb-0">
              <FaCog className="me-2" />
              MENU QUẢN TRỊ
            </h6>
          </div>
          <Nav variant="pills" className="flex-column admin-nav">
            {menuItems.map((item) => (
              <Nav.Item key={item.key}>
                <Nav.Link
                  eventKey={item.key}
                  className="py-3 px-3"
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text">{item.title}</span>
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </Card.Body>
      </Card>
    </>
  );
};

export default AdminSidebar;

import React from "react";
import { Card, Badge } from "react-bootstrap";

const AdminComponentWrapper = ({ icon, title, children, badge = null }) => (
  <Card className="admin-content-card">
    <Card.Header className="bg-light">
      <div className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <span className="me-2">{icon}</span>
          {title}
        </h5>
        {badge && <Badge bg="primary">{badge}</Badge>}
      </div>
    </Card.Header>
    <Card.Body>{children}</Card.Body>
  </Card>
);

export default AdminComponentWrapper;

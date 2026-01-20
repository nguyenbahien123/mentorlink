import React from "react";
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function NotFoundPage() {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6} className="text-center text-white">
            <h1 className="display-1 fw-bold mb-4" style={{ fontSize: '6rem' }}>
              404
            </h1>
            <p className="fs-4 mb-4">
              Oops! Trang bạn tìm kiếm không tồn tại.
            </p>
            <Link to="/">
              <Button
                variant="light"
                size="lg"
                className="px-4 py-2"
                style={{ borderRadius: '25px' }}
              >
                Về trang chủ
              </Button>
            </Link>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

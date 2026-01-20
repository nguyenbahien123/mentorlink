import React, { useState } from 'react';
import { Container, Row, Col, Card, Nav, Tab } from 'react-bootstrap';
import { FaClipboardCheck, FaHeadset, FaChartLine } from 'react-icons/fa';
import {
    ContentReview,
    CustomerSupport,
    ServiceQuality
} from '../../components/moderator';
import '../../styles/components/ModeratorPage.css';
// Component imports are now at the top of the file

const ModeratorPage = () => {
    return (
        <Container fluid className="moderator-page py-4">
            <Row className="mb-4">
                <Col>
                    <h2 className="page-title">Quản lý Moderator</h2>
                    <p className="text-muted">Quản lý và điều hành nội dung và dịch vụ MentorLink</p>
                </Col>
            </Row>

            <Tab.Container defaultActiveKey="content">
                <Row>
                    <Col lg={3} md={4} className="mb-4">
                        <Card className="sidebar-menu">
                            <Card.Body className="p-0">
                                <Nav variant="pills" className="flex-column">
                                    <Nav.Item>
                                        <Nav.Link eventKey="content" className="d-flex align-items-center">
                                            <FaClipboardCheck className="me-2" />
                                            <span>Kiểm duyệt nội dung</span>
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="support" className="d-flex align-items-center">
                                            <FaHeadset className="me-2" />
                                            <span>Hỗ trợ khách hàng</span>
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="quality" className="d-flex align-items-center">
                                            <FaChartLine className="me-2" />
                                            <span>Giám sát chất lượng</span>
                                        </Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Card.Body>
                        </Card>

                        <Card className="mt-3 quick-stats">
                            <Card.Body>
                                <h6 className="text-muted mb-3">Tổng quan</h6>
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Bài chờ duyệt</span>
                                    <span className="badge bg-warning">12</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Hỗ trợ mới</span>
                                    <span className="badge bg-danger">5</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span>Báo cáo</span>
                                    <span className="badge bg-info">3</span>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={9} md={8}>
                        <Tab.Content>
                            <Tab.Pane eventKey="content">
                                <ContentReview />
                            </Tab.Pane>
                            <Tab.Pane eventKey="support">
                                <CustomerSupport />
                            </Tab.Pane>
                            <Tab.Pane eventKey="quality">
                                <ServiceQuality />
                            </Tab.Pane>
                        </Tab.Content>
                    </Col>
                </Row>
            </Tab.Container>
        </Container>
    );
};

export default ModeratorPage;
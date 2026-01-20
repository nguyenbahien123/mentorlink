import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Row, Col, Card, Button, Modal, Form, Alert, Spinner, Table, Nav, Badge, ButtonGroup } from 'react-bootstrap';
import MentorService from '../../../services/mentor/MentorService';
import MentorServiceCrud from '../../../services/mentor/MentorServiceCrud';

const ServiceManagement = () => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mentorId, setMentorId] = useState(null);
    const [services, setServices] = useState([]);
    const [formData, setFormData] = useState({
        serviceName: '',
        description: ''
    });
    const scrollRef = useRef(null);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewService, setViewService] = useState(null);

    const normalizeStatus = (s) => (s || '').toUpperCase();
    const filtered = useMemo(() => {
        if (filterStatus === 'ALL') return services;
        return services.filter(s => normalizeStatus(s.statusCode || s.status) === filterStatus);
    }, [services, filterStatus]);

    const countBy = (status) => services.filter(s => normalizeStatus(s.statusCode || s.status) === status).length;

    const getStatusText = (statusCode) => {
        const status = (statusCode || '').toUpperCase();
        switch (status) {
            case 'APPROVED':
                return 'Đã duyệt';
            case 'PENDING':
                return 'Chờ duyệt';
            case 'REJECTED':
                return 'Từ chối';
            default:
                return status;
        }
    };

    // Load current mentor and services
    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const profileRes = await MentorService.getCurrentMentorProfile();
                const profile = profileRes?.data || profileRes;
                const id = profile?.id;
                setMentorId(id);
                if (id) {
                    await refreshServices(id);
                }
            } catch (e) {
                console.error('Failed to load services', e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const refreshServices = async (id = mentorId) => {
        if (!id) return;
        const res = await MentorServiceCrud.listByMentor(id);
        const list = res?.data || res || [];
        setServices(Array.isArray(list) ? list : []);
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const handleCreateService = async () => {
        if (!mentorId) return;
        try {
            setLoading(true);
            await MentorServiceCrud.create(mentorId, {
                serviceName: formData.serviceName,
                description: formData.description
            });
            await refreshServices();
            setShowCreateModal(false);
            resetForm();
        } catch (e) {
            console.error('Create service failed', e);
        } finally {
            setLoading(false);
        }
    };

    const handleEditService = (service) => {
        setSelectedService(service);
        setFormData({
            serviceName: service.serviceName || service.service_name || '',
            description: service.description || ''
        });
        setShowEditModal(true);
    };

    const handleUpdateService = async () => {
        if (!mentorId || !selectedService?.id) return;
        try {
            setLoading(true);
            await MentorServiceCrud.update(selectedService.id, mentorId, {
                serviceName: formData.serviceName,
                description: formData.description
            });
            await refreshServices();
            setShowEditModal(false);
            resetForm();
        } catch (e) {
            console.error('Update service failed', e);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteService = async (serviceId) => {
        if (!mentorId) return;
        if (window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) {
            try {
                setLoading(true);
                await MentorServiceCrud.remove(serviceId, mentorId);
                await refreshServices();
            } catch (e) {
                console.error('Delete service failed', e);
            } finally {
                setLoading(false);
            }
        }
    };

    // Backend không có API toggle ON/OFF, trạng thái được duyệt bởi admin (PENDING/APPROVED/REJECTED)

    const resetForm = () => {
        setFormData({
            serviceName: '',
            description: ''
        });
        setSelectedService(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <i
                key={index}
                className={`bi bi-star${index < Math.floor(rating) ? '-fill' : ''} text-warning`}
            />
        ));
    };

    return (
        <div className="service-management">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="mb-1">Quản lý dịch vụ</h3>
                    <p className="text-muted mb-0">Tạo và quản lý các dịch vụ tư vấn của bạn</p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => setShowCreateModal(true)}
                    className="btn-mentor"
                >
                    <i className="bi bi-plus-circle me-2"></i>
                    Tạo dịch vụ mới
                </Button>
            </div>

            {loading && (
                <div className="text-center my-3">
                    <Spinner animation="border" />
                </div>
            )}

            {/* Statistics Cards */}
            <Row className="mb-4">
                <Col lg={3} md={6} className="mb-3">
                    <Card className="dashboard-card stat-card">
                        <Card.Body>
                            <div className="stat-icon primary">
                                <i className="bi bi-briefcase"></i>
                            </div>
                            <div className="stat-value">{services.length}</div>
                            <p className="stat-label">Tổng dịch vụ</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                    <Card className="dashboard-card stat-card">
                        <Card.Body>
                            <div className="stat-icon success">
                                <i className="bi bi-check-circle"></i>
                            </div>
                            <div className="stat-value">{services.filter(s => (s.statusCode || '').toUpperCase() === 'APPROVED').length}</div>
                            <p className="stat-label">Đã duyệt</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                    <Card className="dashboard-card stat-card">
                        <Card.Body>
                            <div className="stat-icon info">
                                <i className="bi bi-calendar-check"></i>
                            </div>
                            <div className="stat-value">--</div>
                            <p className="stat-label">Tổng lượt đặt</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                    <Card className="dashboard-card stat-card">
                        <Card.Body>
                            <div className="stat-icon warning">
                                <i className="bi bi-star"></i>
                            </div>
                            <div className="stat-value">--</div>
                            <p className="stat-label">Đánh giá TB</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Toolbar giống phong cách "Lịch làm việc" */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <Nav variant="pills" className="gap-2 flex-wrap status-filter">
                    <Nav.Item>
                        <Nav.Link active={filterStatus === 'ALL'} onClick={() => setFilterStatus('ALL')}>
                            <span className="filter-label" style={{color: "black"}}>Tất cả</span> <Badge bg={filterStatus==='ALL'?'light':'secondary'} text={filterStatus==='ALL'?'dark':'light'} className="ms-1">{services.length}</Badge>
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link active={filterStatus === 'PENDING'} onClick={() => setFilterStatus('PENDING')}>
                            <span className="filter-label" style={{color: "black"}}>Chờ duyệt</span> <Badge bg="warning" text="dark" className="ms-1">{countBy('PENDING')}</Badge>
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link active={filterStatus === 'APPROVED'} onClick={() => setFilterStatus('APPROVED')}>
                            <span className="filter-label" style={{color: "black"}}>Đã duyệt</span> <Badge bg="success" text="dark" className="ms-1">{countBy('APPROVED')}</Badge>
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link active={filterStatus === 'REJECTED'} onClick={() => setFilterStatus('REJECTED')}>
                            <span className="filter-label" style={{color: "black"}}>Từ chối</span> <Badge bg="secondary" className="ms-1">{countBy('REJECTED')}</Badge>
                        </Nav.Link>
                    </Nav.Item>
                </Nav>
                <div className="d-flex align-items-center gap-2 text-muted small">
                    {filtered.length} mục
                </div>
            </div>

            {/* Bảng danh sách thay cho card, dễ quản lý theo chiều ngang */}
            <div className="table-responsive">
                <Table hover className="align-middle">
                    <thead>
                        <tr>
                            <th style={{minWidth: 260}}>Tên dịch vụ</th>
                            
                            <th style={{minWidth: 180}}>Người tạo</th>
                            <th style={{minWidth: 140}}>Trạng thái</th>
                            <th style={{minWidth: 220}}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(service => (
                            <tr key={service.id}>
                                <td>
                                    <div className="fw-semibold">{service.serviceName || service.service_name}</div>
                                    <div className="text-muted small mt-1" style={{maxWidth: 560, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                                        {service.description}
                                    </div>
                                </td>
                                
                                <td>{service.mentorName || 'Bạn'}</td>
                                <td>
                                    <span className={`badge ${
                                        (service.statusCode || '').toUpperCase() === 'APPROVED' ? 'bg-success'
                                        : (service.statusCode || '').toUpperCase() === 'PENDING' ? 'bg-warning text-dark'
                                        : 'bg-secondary'
                                    }`}>
                                        {getStatusText(service.statusCode)}
                                    </span>
                                </td>
                                <td>
                                    <div className="d-flex gap-2">
                                        <Button variant="outline-secondary" size="sm" onClick={() => { setViewService(service); setShowViewModal(true); }}>
                                            <i className="bi bi-eye me-1"></i> Xem
                                        </Button>
                                        <Button variant="outline-primary" size="sm" onClick={() => handleEditService(service)}>
                                            <i className="bi bi-pencil me-1"></i> Cập nhật
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={7} className="text-center text-muted py-4">Không có dịch vụ phù hợp</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>

            {/* Create Service Modal */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Tạo dịch vụ mới</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Tên dịch vụ <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                name="serviceName"
                                placeholder="Nhập tên dịch vụ"
                                value={formData.serviceName}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Mô tả dịch vụ <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                name="description"
                                placeholder="Mô tả chi tiết về dịch vụ của bạn"
                                value={formData.description}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Alert variant="info">
                            <i className="bi bi-info-circle me-2"></i>
                            Sau khi tạo/cập nhật, dịch vụ sẽ có trạng thái PENDING và chờ admin duyệt.
                        </Alert>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleCreateService}
                        disabled={!formData.serviceName || !formData.description}
                    >
                        <i className="bi bi-plus me-2"></i>
                        Tạo dịch vụ
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Edit Service Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Chỉnh sửa dịch vụ</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Tên dịch vụ <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                name="serviceName"
                                placeholder="Nhập tên dịch vụ"
                                value={formData.serviceName}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Mô tả dịch vụ <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                name="description"
                                placeholder="Mô tả chi tiết về dịch vụ của bạn"
                                value={formData.description}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleUpdateService}
                        disabled={!formData.serviceName || !formData.description}
                    >
                        <i className="bi bi-save me-2"></i>
                        Cập nhật
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* View Detail Modal */}
            <Modal show={showViewModal} onHide={() => setShowViewModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Chi tiết dịch vụ</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {viewService ? (
                        <div>
                            <div className="mb-2"><strong>Tên dịch vụ:</strong> {viewService.serviceName || viewService.service_name}</div>
                            <div className="mb-2"><strong>Trạng thái:</strong> {getStatusText(viewService.statusCode)}</div>
                            <div className="mb-2"><strong>Người tạo:</strong> {viewService.mentorName || 'Bạn'}</div>
                            <div className="mb-2"><strong>Mô tả:</strong><br/>{viewService.description}</div>
                            <div className="text-muted small">
                                <div><i className="bi bi-calendar me-1"></i> Tạo: {formatDateTime(viewService.createdAt || viewService.created_at)}</div>
                                {viewService.updatedAt && <div><i className="bi bi-pencil me-1"></i> Cập nhật: {formatDateTime(viewService.updatedAt)}</div>}
                            </div>
                        </div>
                    ) : 'Đang tải...'}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowViewModal(false)}>
                        Đóng
                    </Button>
                    {viewService && (
                        <Button variant="primary" onClick={() => { setShowViewModal(false); handleEditService(viewService); }}>
                            <i className="bi bi-pencil me-1"></i> Cập nhật
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>

            <style jsx>{`
                .service-card {
                    transition: all 0.3s ease;
                }
                
                .service-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
                }
                .status-filter .nav-link {
                    background-color: #f6f8fc;
                    border: 1px solid #e5e7ef;
                    color: #1f2937;
                    padding: 10px 16px;
                    font-weight: 600;
                    border-radius: 10px;
                }
                .status-filter .nav-link.active {
                    background-color: #0d6efd;
                    color: #fff;
                    border-color: #0d6efd;
                }
                .status-filter .filter-label { letter-spacing: .2px; }
                
                .stat-mini {
                    padding: 0.5rem;
                }
                
                .stat-mini-value {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--primary-color);
                }
                
                .stat-mini-label {
                    font-size: 0.75rem;
                    color: var(--text-color);
                    opacity: 0.7;
                }
                
                .service-meta {
                    border-top: 1px solid var(--border-color);
                    padding-top: 0.75rem;
                }
            `}</style>
        </div>
    );
};

export default ServiceManagement;
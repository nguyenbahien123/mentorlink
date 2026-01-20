import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Table, Button, Badge, Modal, Form, Nav, Spinner } from 'react-bootstrap';
import MentorExperienceService from '../../../services/mentor/MentorExperienceService';
import MentorService from '../../../services/mentor/MentorService';
import { useToast } from '../../../contexts/ToastContext';

const MentorExperienceManagement = () => {
    const { showToast } = useToast();
    const [experiences, setExperiences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedExperience, setSelectedExperience] = useState(null);
    const [mentorId, setMentorId] = useState(null);
    const [filterStatus, setFilterStatus] = useState('ALL');

    // Form state
    const [formData, setFormData] = useState({
        companyName: '',
        position: '',
        startDate: '',
        endDate: '',
        experienceImageFile: null,
        experienceImagePreview: null
    });

    const normalizeStatus = (s) => (s || '').toUpperCase();
    const filtered = useMemo(() => {
        if (filterStatus === 'ALL') return experiences;
        return experiences.filter(e => normalizeStatus(e.statusCode || e.status) === filterStatus);
    }, [experiences, filterStatus]);

    const countBy = (status) => experiences.filter(e => normalizeStatus(e.statusCode || e.status) === status).length;

    // Load current mentor and experiences
    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const profileRes = await MentorService.getCurrentMentorProfile();
                const profile = profileRes?.data || profileRes;
                const id = profile?.id;
                setMentorId(id);
                if (id) {
                    await refreshExperiences(id);
                }
            } catch (e) {
                console.error('Failed to load experiences', e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const refreshExperiences = async (id = mentorId) => {
        if (!id) return;
        const res = await MentorExperienceService.listByMentor(id);
        console.log('refreshExperiences - Raw API response:', res);
        const list = res?.data || res || [];
        console.log('refreshExperiences - Extracted list:', list);
        console.log('refreshExperiences - First item:', list[0]);
        console.log('refreshExperiences - First item keys:', list[0] ? Object.keys(list[0]) : 'no items');
        setExperiences(Array.isArray(list) ? list : []);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

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

    const getStatusBadgeColor = (statusCode) => {
        const status = (statusCode || '').toUpperCase();
        switch (status) {
            case 'APPROVED':
                return 'bg-success';
            case 'PENDING':
                return 'bg-warning text-dark';
            case 'REJECTED':
                return 'bg-secondary';
            default:
                return 'bg-secondary';
        }
    };

    const handleCreateExperience = async () => {
        if (!mentorId) return;
        try {
            setLoading(true);
            
            // Create FormData for multipart upload
            const formDataToSend = new FormData();
            formDataToSend.append('companyName', formData.companyName);
            formDataToSend.append('position', formData.position);
            if (formData.startDate) formDataToSend.append('startDate', formData.startDate);
            if (formData.endDate) formDataToSend.append('endDate', formData.endDate);
            if (formData.experienceImageFile) {
                formDataToSend.append('scoreImageFile', formData.experienceImageFile);
            }
            
            await MentorExperienceService.create(mentorId, formDataToSend);
            await refreshExperiences();
            setShowCreateModal(false);
            resetForm();
            showToast('Tạo kinh nghiệm thành công!', 'success');
        } catch (e) {
            console.error('Create experience failed', e);
            showToast('Tạo kinh nghiệm thất bại: ' + (e.response?.data?.message || e.message), 'danger');
        } finally {
            setLoading(false);
        }
    };

    const handleEditExperience = (experience) => {
        console.log('handleEditExperience - Full experience object:', experience);
        console.log('experience.id:', experience.id);
        console.log('All experience keys:', Object.keys(experience));
        setSelectedExperience(experience);
        setFormData({
            companyName: experience.companyName || '',
            position: experience.position || '',
            startDate: experience.startDate || '',
            endDate: experience.endDate || '',
            experienceImageFile: null,
            experienceImagePreview: experience.experienceImage || null
        });
        setShowEditModal(true);
    };

    const handleUpdateExperience = async () => {
        console.log('handleUpdateExperience called');
        console.log('mentorId:', mentorId);
        console.log('selectedExperience:', selectedExperience);
        console.log('selectedExperience?.id:', selectedExperience?.id);
        console.log('formData:', formData);
        
        // Try to get ID from different possible properties
        const experienceId = selectedExperience?.id || selectedExperience?.experienceId || selectedExperience?.experience_id;
        console.log('Resolved experienceId:', experienceId);
        
        if (!mentorId || !experienceId) {
            console.error('Missing mentorId or experienceId');
            console.error('Available selectedExperience keys:', selectedExperience ? Object.keys(selectedExperience) : 'selectedExperience is null');
            showToast('Lỗi: Không tìm thấy thông tin mentor hoặc kinh nghiệm', 'danger');
            return;
        }
        
        // Validate required fields
        if (!formData.companyName || !formData.position) {
            showToast('Vui lòng điền đầy đủ tên công ty và vị trí', 'warning');
            return;
        }
        
        try {
            setLoading(true);
            
            // Create FormData for multipart upload
            const formDataToSend = new FormData();
            formDataToSend.append('companyName', formData.companyName);
            formDataToSend.append('position', formData.position);
            if (formData.startDate) formDataToSend.append('startDate', formData.startDate);
            if (formData.endDate) formDataToSend.append('endDate', formData.endDate);
            if (formData.experienceImageFile) {
                formDataToSend.append('scoreImageFile', formData.experienceImageFile);
            }
            
            console.log('Sending update request with experienceId:', experienceId);
            const result = await MentorExperienceService.update(experienceId, mentorId, formDataToSend);
            console.log('Update successful:', result);
            
            await refreshExperiences();
            setShowEditModal(false);
            resetForm();
            showToast('Cập nhật kinh nghiệm thành công!', 'success');
        } catch (e) {
            console.error('Update experience failed', e);
            showToast('Cập nhật kinh nghiệm thất bại: ' + (e.response?.data?.message || e.message), 'danger');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteExperience = async (experience) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa kinh nghiệm này?')) return;
        try {
            await MentorExperienceService.remove(experience.id, mentorId);
            await refreshExperiences();
            showToast('Xóa kinh nghiệm thành công!', 'success');
        } catch (e) {
            console.error('Delete experience failed', e);
            showToast('Xóa kinh nghiệm thất bại: ' + (e.response?.data?.message || e.message), 'danger');
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Vui lòng chọn file hình ảnh');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('Kích thước file không được vượt quá 5MB');
                return;
            }
            const previewUrl = URL.createObjectURL(file);
            setFormData(prev => ({
                ...prev,
                experienceImageFile: file,
                experienceImagePreview: previewUrl
            }));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const resetForm = () => {
        setFormData({
            companyName: '',
            position: '',
            startDate: '',
            endDate: '',
            experienceImageFile: null,
            experienceImagePreview: null
        });
    };

    const handleViewExperience = (experience) => {
        setSelectedExperience(experience);
        setFormData({
            companyName: experience.companyName || '',
            position: experience.position || '',
            startDate: experience.startDate || '',
            endDate: experience.endDate || '',
            experienceImageFile: null,
            experienceImagePreview: experience.experienceImage || null
        });
        setShowViewModal(true);
    };

    if (loading) {
        return (
            <div className="text-center my-3">
                <Spinner animation="border" />
            </div>
        );
    }

    return (
        <div className="experience-management">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="mb-1">Quản lý kinh nghiệm</h3>
                    <p className="text-muted mb-0">Tạo và quản lý thông tin kinh nghiệm công việc của bạn</p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => setShowCreateModal(true)}
                    className="btn-mentor"
                >
                    <i className="bi bi-plus-circle me-2"></i>
                    Thêm kinh nghiệm mới
                </Button>
            </div>

            {/* Statistics Cards */}
            <Row className="mb-4">
                <Col lg={4} md={6} className="mb-3">
                    <Card className="dashboard-card stat-card">
                        <Card.Body>
                            <div className="stat-icon primary">
                                <i className="bi bi-briefcase"></i>
                            </div>
                            <div className="stat-value">{experiences.length}</div>
                            <p className="stat-label">Tổng kinh nghiệm</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={4} md={6} className="mb-3">
                    <Card className="dashboard-card stat-card">
                        <Card.Body>
                            <div className="stat-icon success">
                                <i className="bi bi-check-circle"></i>
                            </div>
                            <div className="stat-value">{countBy('APPROVED')}</div>
                            <p className="stat-label">Đã duyệt</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={4} md={6} className="mb-3">
                    <Card className="dashboard-card stat-card">
                        <Card.Body>
                            <div className="stat-icon warning">
                                <i className="bi bi-hourglass-split"></i>
                            </div>
                            <div className="stat-value">{countBy('PENDING')}</div>
                            <p className="stat-label">Chờ duyệt</p>
                        </Card.Body>
                    </Card>
                </Col>
                
            </Row>

            {/* Status Filter Toolbar */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <Nav variant="pills" className="gap-2 flex-wrap status-filter">
                    <Nav.Item>
                        <Nav.Link active={filterStatus === 'ALL'} onClick={() => setFilterStatus('ALL')}>
                            <span className="filter-label" style={{color: "black"}}>Tất cả</span> <Badge bg={filterStatus==='ALL'?'light':'secondary'} text={filterStatus==='ALL'?'dark':'light'} className="ms-1">{experiences.length}</Badge>
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

            {/* Table List */}
            <div className="table-responsive">
                <Table hover className="align-middle">
                    <thead>
                        <tr>
                            <th style={{minWidth: 200}}>Công ty</th>
                            <th style={{minWidth: 180}}>Vị trí</th>
                            <th style={{minWidth: 150}}>Thời gian</th>
                            <th style={{minWidth: 180}}>Chứng chỉ</th>
                            <th style={{minWidth: 140}}>Trạng thái</th>
                            <th style={{minWidth: 200}}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((experience, index) => {
                            // Find the original experience object from experiences array to ensure we have all properties including ID
                            const fullExperience = experiences.find(e => 
                                (e.companyName === experience.companyName) &&
                                (e.position === experience.position)
                            ) || experience;
                            
                            
                            return (
                            <tr key={experience.id || index}>
                                <td>
                                    <div className="fw-semibold">{experience.companyName}</div>
                                </td>
                                <td>{experience.position || '--'}</td>
                                <td>
                                    <div className="text-muted small">
                                        {formatDate(experience.startDate)} 
                                        {' - '}
                                        {experience.endDate ? formatDate(experience.endDate) : 'Hiện tại'}
                                    </div>
                                </td>
                                <td>
                                    {experience.experienceImage ? (
                                        <a href={experience.experienceImage} target="_blank" rel="noopener noreferrer" className="text-primary">
                                            <i className="bi bi-image me-1"></i> Xem ảnh
                                        </a>
                                    ) : (
                                        <span className="text-muted">Chưa có</span>
                                    )}
                                </td>
                                <td>
                                    <span className={`badge ${getStatusBadgeColor(experience.statusCode)}`}>
                                        {getStatusText(experience.statusCode)}
                                    </span>
                                </td>
                                <td>
                                    <Button
                                        variant="outline-info"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => handleViewExperience(fullExperience)}
                                    >
                                        <i className="bi bi-eye"></i>
                                    </Button>
                                    <Button
                                        variant="outline-warning"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => handleEditExperience(fullExperience)}
                                    >
                                        <i className="bi bi-pencil"></i>
                                    </Button>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleDeleteExperience(fullExperience)}
                                    >
                                        <i className="bi bi-trash"></i>
                                    </Button>
                                </td>
                            </tr>
                        )})}
                    </tbody>
                </Table>
            </div>

            {/* Create Modal */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Thêm kinh nghiệm mới</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Tên công ty <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleInputChange}
                            placeholder="Nhập tên công ty"
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Vị trí <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="text"
                            name="position"
                            value={formData.position}
                            onChange={handleInputChange}
                            placeholder="Nhập vị trí công việc"
                            required
                        />
                    </Form.Group>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Ngày bắt đầu</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Ngày kết thúc</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleInputChange}
                                />
                                <Form.Text className="text-muted">
                                    Để trống nếu đang làm việc
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Hình ảnh chứng chỉ</Form.Label>
                        <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <Form.Text className="text-muted">
                            Chấp nhận file ảnh, tối đa 5MB
                        </Form.Text>
                    </Form.Group>

                    {formData.experienceImagePreview && (
                        <div className="mb-3">
                            <Form.Label>Xem trước hình ảnh</Form.Label>
                            <div>
                                <img
                                    src={formData.experienceImagePreview}
                                    alt="Preview"
                                    style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
                                />
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handleCreateExperience}>
                        Tạo mới
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Edit Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Chỉnh sửa kinh nghiệm</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Tên công ty <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleInputChange}
                            placeholder="Nhập tên công ty"
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Vị trí <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="text"
                            name="position"
                            value={formData.position}
                            onChange={handleInputChange}
                            placeholder="Nhập vị trí công việc"
                            required
                        />
                    </Form.Group>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Ngày bắt đầu</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Ngày kết thúc</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleInputChange}
                                />
                                <Form.Text className="text-muted">
                                    Để trống nếu đang làm việc
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Hình ảnh chứng chỉ</Form.Label>
                        <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <Form.Text className="text-muted">
                            Chấp nhận file ảnh, tối đa 5MB
                        </Form.Text>
                    </Form.Group>

                    {formData.experienceImagePreview && (
                        <div className="mb-3">
                            <Form.Label>Xem trước hình ảnh</Form.Label>
                            <div>
                                <img
                                    src={formData.experienceImagePreview}
                                    alt="Preview"
                                    style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
                                />
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)} disabled={loading}>
                        Hủy
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleUpdateExperience}
                        disabled={loading || !formData.companyName || !formData.position}
                    >
                        {loading ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Đang cập nhật...
                            </>
                        ) : (
                            'Cập nhật'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* View Modal */}
            <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Chi tiết kinh nghiệm</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Tên công ty</Form.Label>
                        <p>{formData.companyName}</p>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Vị trí</Form.Label>
                        <p>{formData.position}</p>
                    </Form.Group>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Ngày bắt đầu</Form.Label>
                                <p>{formatDate(formData.startDate)}</p>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Ngày kết thúc</Form.Label>
                                <p>{formData.endDate ? formatDate(formData.endDate) : 'Đang làm việc'}</p>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Trạng thái</Form.Label>
                        <p>
                            <span className={`badge ${getStatusBadgeColor(selectedExperience?.statusCode)}`}>
                                {getStatusText(selectedExperience?.statusCode)}
                            </span>
                        </p>
                    </Form.Group>

                    {formData.experienceImagePreview && (
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Hình ảnh</Form.Label>
                            <div>
                                <img
                                    src={formData.experienceImagePreview}
                                    alt="Experience"
                                    style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
                                />
                            </div>
                        </Form.Group>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowViewModal(false)}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default MentorExperienceManagement;
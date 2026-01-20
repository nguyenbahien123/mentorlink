import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Row, Col, Card, Button, Modal, Form, Alert, Spinner, Table, Nav, Badge } from 'react-bootstrap';
import MentorService from '../../../services/mentor/MentorService';
import MentorEducationService from '../../../services/mentor/MentorEducationService';
import { useToast } from '../../../contexts/ToastContext';

const MentorEducationManagement = () => {
    const { showToast } = useToast();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedEducation, setSelectedEducation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mentorId, setMentorId] = useState(null);
    const [educations, setEducations] = useState([]);
    const [formData, setFormData] = useState({
        schoolName: '',
        major: '',
        startDate: '',
        endDate: '',
        certificateImageFile: null,
        certificateImagePreview: null
    });
    const scrollRef = useRef(null);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewEducation, setViewEducation] = useState(null);

    const normalizeStatus = (s) => (s || '').toUpperCase();
    const filtered = useMemo(() => {
        if (filterStatus === 'ALL') return educations;
        return educations.filter(e => normalizeStatus(e.statusCode || e.status) === filterStatus);
    }, [educations, filterStatus]);

    const countBy = (status) => educations.filter(e => normalizeStatus(e.statusCode || e.status) === status).length;

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

    // Load current mentor and educations
    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const profileRes = await MentorService.getCurrentMentorProfile();
                const profile = profileRes?.data || profileRes;
                const id = profile?.id;
                setMentorId(id);
                if (id) {
                    await refreshEducations(id);
                }
            } catch (e) {
                console.error('Failed to load educations', e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const refreshEducations = async (id = mentorId) => {
        if (!id) return;
        const res = await MentorEducationService.listByMentor(id);
        console.log('refreshEducations - Raw API response:', res);
        const list = res?.data || res || [];
        console.log('refreshEducations - Extracted list:', list);
        console.log('refreshEducations - First item:', list[0]);
        console.log('refreshEducations - First item keys:', list[0] ? Object.keys(list[0]) : 'no items');
        setEducations(Array.isArray(list) ? list : []);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const handleCreateEducation = async () => {
        if (!mentorId) return;
        try {
            setLoading(true);
            
            // Create FormData for multipart upload
            const formDataToSend = new FormData();
            formDataToSend.append('schoolName', formData.schoolName);
            formDataToSend.append('major', formData.major);
            if (formData.startDate) formDataToSend.append('startDate', formData.startDate);
            if (formData.endDate) formDataToSend.append('endDate', formData.endDate);
            if (formData.certificateImageFile) {
                formDataToSend.append('scoreImageFile', formData.certificateImageFile);
            }
            
            await MentorEducationService.create(mentorId, formDataToSend);
            await refreshEducations();
            setShowCreateModal(false);
            resetForm();
            showToast('Tạo học vấn thành công!', 'success');
        } catch (e) {
            console.error('Create education failed', e);
            showToast('Tạo học vấn thất bại: ' + (e.response?.data?.message || e.message), 'danger');
        } finally {
            setLoading(false);
        }
    };

    const handleEditEducation = (education) => {
        console.log('handleEditEducation - Full education object:', education);
        console.log('education.id:', education.id);
        console.log('All education keys:', Object.keys(education));
        setSelectedEducation(education);
        setFormData({
            schoolName: education.schoolName || education.school_name || '',
            major: education.major || '',
            startDate: education.startDate || education.start_date || '',
            endDate: education.endDate || education.end_date || '',
            certificateImageFile: null,
            certificateImagePreview: education.certificateImage || education.certificate_image || null
        });
        setShowEditModal(true);
    };

    const handleUpdateEducation = async () => {
        console.log('handleUpdateEducation called');
        console.log('mentorId:', mentorId);
        console.log('selectedEducation:', selectedEducation);
        console.log('selectedEducation?.id:', selectedEducation?.id);
        console.log('formData:', formData);
        
        // Try to get ID from different possible properties
        const educationId = selectedEducation?.id || selectedEducation?.educationId || selectedEducation?.education_id;
        console.log('Resolved educationId:', educationId);
        
        if (!mentorId || !educationId) {
            console.error('Missing mentorId or educationId');
            console.error('Available selectedEducation keys:', selectedEducation ? Object.keys(selectedEducation) : 'selectedEducation is null');
            showToast('Lỗi: Không tìm thấy thông tin mentor hoặc học vấn', 'danger');
            return;
        }
        
        // Validate required fields
        if (!formData.schoolName || !formData.major) {
            showToast('Vui lòng điền đầy đủ tên trường và chuyên ngành', 'warning');
            return;
        }
        
        try {
            setLoading(true);
            
            // Create FormData for multipart upload
            const formDataToSend = new FormData();
            formDataToSend.append('schoolName', formData.schoolName);
            formDataToSend.append('major', formData.major);
            if (formData.startDate) formDataToSend.append('startDate', formData.startDate);
            if (formData.endDate) formDataToSend.append('endDate', formData.endDate);
            if (formData.certificateImageFile) {
                formDataToSend.append('scoreImageFile', formData.certificateImageFile);
            }
            
            console.log('Sending update request with educationId:', educationId);
            const result = await MentorEducationService.update(educationId, mentorId, formDataToSend);
            console.log('Update successful:', result);
            
            await refreshEducations();
            setShowEditModal(false);
            resetForm();
            showToast('Cập nhật học vấn thành công!', 'success');
        } catch (e) {
            console.error('Update education failed', e);
            showToast('Cập nhật học vấn thất bại: ' + (e.response?.data?.message || e.message), 'danger');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEducation = async (educationId) => {
        if (!mentorId) return;
        if (window.confirm('Bạn có chắc chắn muốn xóa học vấn này?')) {
            try {
                setLoading(true);
                await MentorEducationService.remove(educationId, mentorId);
                await refreshEducations();
                showToast('Xóa học vấn thành công!', 'success');
            } catch (e) {
                console.error('Delete education failed', e);
                showToast('Xóa học vấn thất bại: ' + (e.response?.data?.message || e.message), 'danger');
            } finally {
                setLoading(false);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            schoolName: '',
            major: '',
            startDate: '',
            endDate: '',
            certificateImageFile: null,
            certificateImagePreview: null
        });
        setSelectedEducation(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Vui lòng chọn file hình ảnh!');
                e.target.value = '';
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Kích thước file không được vượt quá 5MB!');
                e.target.value = '';
                return;
            }
            
            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            
            setFormData(prev => ({
                ...prev,
                certificateImageFile: file,
                certificateImagePreview: previewUrl
            }));
        }
    };

    return (
        <div className="education-management">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="mb-1">Quản lý học vấn</h3>
                    <p className="text-muted mb-0">Tạo và quản lý thông tin học vấn của bạn</p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => setShowCreateModal(true)}
                    className="btn-mentor"
                >
                    <i className="bi bi-plus-circle me-2"></i>
                    Thêm học vấn mới
                </Button>
            </div>

            {loading && (
                <div className="text-center my-3">
                    <Spinner animation="border" />
                </div>
            )}

            {/* Statistics Cards */}
            <Row className="mb-4">
                <Col lg={4} md={6} className="mb-3">
                    <Card className="dashboard-card stat-card">
                        <Card.Body>
                            <div className="stat-icon primary">
                                <i className="bi bi-mortarboard"></i>
                            </div>
                            <div className="stat-value">{educations.length}</div>
                            <p className="stat-label">Tổng học vấn</p>
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
                            <span className="filter-label" style={{color: "black"}}>Tất cả</span> <Badge bg={filterStatus==='ALL'?'light':'secondary'} text={filterStatus==='ALL'?'dark':'light'} className="ms-1">{educations.length}</Badge>
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
                            <th style={{minWidth: 200}}>Trường học</th>
                            <th style={{minWidth: 160}}>Chuyên ngành</th>
                            <th style={{minWidth: 130}}>Thời gian</th>
                            <th style={{minWidth: 160}}>Chứng chỉ</th>
                            <th style={{minWidth: 120}}>Trạng thái</th>
                            <th style={{minWidth: 200}}>Action</th>
                        </tr>   
                    </thead>
                    <tbody>
                        {filtered.map((education, index) => {
                            // Find the original education object from educations array to ensure we have all properties including ID
                            const fullEducation = educations.find(e => 
                                (e.schoolName === education.schoolName || e.school_name === education.schoolName) &&
                                (e.major === education.major)
                            ) || education;
                            
                            
                            return (
                            <tr key={education.id || index}>
                                <td>
                                    <div className="fw-semibold">{education.schoolName || education.school_name}</div>
                                </td>
                                <td>{education.major || '--'}</td>
                                <td>
                                    <div className="text-muted small">
                                        {formatDate(education.startDate || education.start_date)} 
                                        {' - '}
                                        {education.endDate || education.end_date ? formatDate(education.endDate || education.end_date) : 'Hiện tại'}
                                    </div>
                                </td>
                                <td>
                                    {education.certificateImage || education.certificate_image ? (
                                        <a href={education.certificateImage || education.certificate_image} target="_blank" rel="noopener noreferrer" className="text-primary">
                                            <i className="bi bi-image me-1"></i> Xem ảnh
                                        </a>
                                    ) : (
                                        <span className="text-muted">Chưa có</span>
                                    )}
                                </td>
                                <td>
                                    <span className={`badge ${
                                        (education.statusCode || '').toUpperCase() === 'APPROVED' ? 'bg-success'
                                        : (education.statusCode || '').toUpperCase() === 'PENDING' ? 'bg-warning text-dark'
                                        : 'bg-secondary'
                                    }`}>
                                        {getStatusText(education.statusCode)}
                                    </span>
                                </td>
                                <td>
                                    <div className="d-flex gap-2">
                                        <Button variant="outline-secondary" size="sm" onClick={() => { setViewEducation(fullEducation); setShowViewModal(true); }}>
                                            <i className="bi bi-eye me-1"></i> Xem
                                        </Button>
                                        <Button variant="outline-primary" size="sm" onClick={() => handleEditEducation(fullEducation)}>
                                            <i className="bi bi-pencil me-1"></i> Cập nhật
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        )})}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center text-muted py-4">Không có học vấn phù hợp</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>

            {/* Create Education Modal */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Thêm học vấn mới</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Tên trường <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                name="schoolName"
                                placeholder="Nhập tên trường học (VD: FPT University, Stanford...)"
                                value={formData.schoolName}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Chuyên ngành <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                name="major"
                                placeholder="Nhập chuyên ngành (VD: Computer Science, Business...)"
                                value={formData.major}
                                onChange={handleInputChange}
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
                                        Để trống nếu đang học
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Hình ảnh bằng cấp/chứng chỉ</Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <Form.Text className="text-muted">
                                Chọn file hình ảnh bằng cấp (jpg, png, gif - tối đa 5MB)
                            </Form.Text>
                        </Form.Group>

                        {formData.certificateImagePreview && (
                            <div className="mb-3">
                                <div className="border rounded p-2 bg-light">
                                    <small className="text-muted d-block mb-2">Xem trước hình ảnh:</small>
                                    <div className="text-center">
                                        <img 
                                            src={formData.certificateImagePreview} 
                                            alt="Preview" 
                                            style={{maxWidth: '100%', maxHeight: '300px', objectFit: 'contain'}}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <Alert variant="info">
                            <i className="bi bi-info-circle me-2"></i>
                            Sau khi tạo/cập nhật, học vấn sẽ có trạng thái PENDING và chờ admin duyệt.
                        </Alert>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleCreateEducation}
                        disabled={!formData.schoolName || !formData.major}
                    >
                        <i className="bi bi-plus me-2"></i>
                        Thêm học vấn
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Edit Education Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Chỉnh sửa học vấn</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Tên trường <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                name="schoolName"
                                placeholder="Nhập tên trường học (VD: FPT University, Stanford...)"
                                value={formData.schoolName}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Chuyên ngành <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                name="major"
                                placeholder="Nhập chuyên ngành (VD: Computer Science, Business...)"
                                value={formData.major}
                                onChange={handleInputChange}
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
                                        Để trống nếu đang học
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Hình ảnh bằng cấp/chứng chỉ {!formData.certificateImagePreview && <span className="text-danger">*</span>}</Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <Form.Text className="text-muted">
                                {formData.certificateImagePreview ? 'Chọn file mới để thay đổi hình ảnh hiện tại' : 'Chọn file hình ảnh bằng cấp (jpg, png, gif - tối đa 5MB)'}
                            </Form.Text>
                        </Form.Group>

                        {formData.certificateImagePreview && (
                            <div className="mb-3">
                                <div className="border rounded p-2 bg-light">
                                    <small className="text-muted d-block mb-2">
                                        {formData.certificateImageFile ? 'Xem trước hình ảnh mới:' : 'Hình ảnh hiện tại:'}
                                    </small>
                                    <div className="text-center">
                                        <img 
                                            src={formData.certificateImagePreview} 
                                            alt="Preview" 
                                            style={{maxWidth: '100%', maxHeight: '300px', objectFit: 'contain'}}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)} disabled={loading}>
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleUpdateEducation}
                        disabled={loading || !formData.schoolName || !formData.major}
                    >
                        {loading ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Đang cập nhật...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-save me-2"></i>
                                Cập nhật
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* View Detail Modal */}
            <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Chi tiết học vấn</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {viewEducation ? (
                        <div>
                            <div className="mb-3">
                                <strong>Trường học:</strong> 
                                <div className="mt-1 fs-5">{viewEducation.schoolName || viewEducation.school_name}</div>
                            </div>
                            
                            <div className="mb-3">
                                <strong>Chuyên ngành:</strong>
                                <div className="mt-1">
                                    <Badge bg="info" className="fs-6 px-3 py-2">{viewEducation.major || 'Chưa có'}</Badge>
                                </div>
                            </div>

                            <div className="mb-3">
                                <strong>Thời gian học:</strong>
                                <div className="mt-1">
                                    {formatDate(viewEducation.startDate || viewEducation.start_date)} 
                                    {' - '}
                                    {viewEducation.endDate || viewEducation.end_date ? formatDate(viewEducation.endDate || viewEducation.end_date) : 'Hiện tại'}
                                </div>
                            </div>

                            <div className="mb-3">
                                <strong>Trạng thái:</strong>
                                <div className="mt-1">
                                    <span className={`badge ${
                                        (viewEducation.statusCode || '').toUpperCase() === 'APPROVED' ? 'bg-success'
                                        : (viewEducation.statusCode || '').toUpperCase() === 'PENDING' ? 'bg-warning text-dark'
                                        : 'bg-secondary'
                                    }`}>
                                        {getStatusText(viewEducation.statusCode)}
                                    </span>
                                </div>
                            </div>

                            <div className="mb-3">
                                <strong>Hình ảnh bằng cấp:</strong>
                                {viewEducation.certificateImage || viewEducation.certificate_image ? (
                                    <div className="mt-2 border rounded p-2">
                                        <img 
                                            src={viewEducation.certificateImage || viewEducation.certificate_image} 
                                            alt="Certificate" 
                                            style={{maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', display: 'block', margin: '0 auto'}}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'block';
                                            }}
                                        />
                                        <div style={{display: 'none'}} className="text-muted text-center py-3">
                                            <i className="bi bi-image-fill fs-1"></i>
                                            <p className="mt-2">Không thể tải hình ảnh</p>
                                            <a href={viewEducation.certificateImage || viewEducation.certificate_image} target="_blank" rel="noopener noreferrer">
                                                Xem trong tab mới <i className="bi bi-box-arrow-up-right ms-1"></i>
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-muted mt-2">Chưa có hình ảnh</div>
                                )}
                            </div>
                        </div>
                    ) : 'Đang tải...'}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowViewModal(false)}>
                        Đóng
                    </Button>
                    {viewEducation && (
                        <Button variant="primary" onClick={() => { setShowViewModal(false); handleEditEducation(viewEducation); }}>
                            <i className="bi bi-pencil me-1"></i> Cập nhật
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>

            <style jsx>{`
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
            `}</style>
        </div>
    );
};

export default MentorEducationManagement;

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Row, Col, Card, Button, Modal, Form, Alert, Spinner, Table, Nav, Badge, ButtonGroup } from 'react-bootstrap';
import MentorService from '../../../services/mentor/MentorService';
import MentorTestService from '../../../services/mentor/MentorTestService';
import { useToast } from '../../../contexts/ToastContext';

const MentorTestManagement = () => {
    const { showToast } = useToast();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedTest, setSelectedTest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mentorId, setMentorId] = useState(null);
    const [tests, setTests] = useState([]);
    const [formData, setFormData] = useState({
        testName: '',
        score: '',
        scoreImageFile: null,
        scoreImagePreview: null
    });
    const scrollRef = useRef(null);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewTest, setViewTest] = useState(null);

    const normalizeStatus = (s) => (s || '').toUpperCase();
    const filtered = useMemo(() => {
        if (filterStatus === 'ALL') return tests;
        return tests.filter(t => normalizeStatus(t.statusCode || t.status) === filterStatus);
    }, [tests, filterStatus]);

    const countBy = (status) => tests.filter(t => normalizeStatus(t.statusCode || t.status) === status).length;

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

    // Load current mentor and tests
    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const profileRes = await MentorService.getCurrentMentorProfile();
                const profile = profileRes?.data || profileRes;
                const id = profile?.id;
                setMentorId(id);
                if (id) {
                    await refreshTests(id);
                }
            } catch (e) {
                console.error('Failed to load tests', e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const refreshTests = async (id = mentorId) => {
        if (!id) return;
        const res = await MentorTestService.listByMentor(id);
        console.log('refreshTests - Raw API response:', res);
        const list = res?.data || res || [];
        console.log('refreshTests - Extracted list:', list);
        console.log('refreshTests - First item:', list[0]);
        console.log('refreshTests - First item keys:', list[0] ? Object.keys(list[0]) : 'no items');
        setTests(Array.isArray(list) ? list : []);
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const handleCreateTest = async () => {
        if (!mentorId) return;
        try {
            setLoading(true);
            
            // Create FormData for multipart upload
            const formDataToSend = new FormData();
            formDataToSend.append('testName', formData.testName);
            formDataToSend.append('score', formData.score);
            if (formData.scoreImageFile) {
                formDataToSend.append('scoreImageFile', formData.scoreImageFile);
            }
            
            await MentorTestService.create(mentorId, formDataToSend);
            await refreshTests();
            setShowCreateModal(false);
            resetForm();
            showToast('Tạo bài test thành công!', 'success');
        } catch (e) {
            console.error('Create test failed', e);
            showToast('Tạo bài test thất bại: ' + (e.response?.data?.message || e.message), 'danger');
        } finally {
            setLoading(false);
        }
    };

    const handleEditTest = (test) => {
        console.log('handleEditTest - Full test object:', test);
        console.log('test.id:', test.id);
        console.log('All test keys:', Object.keys(test));
        setSelectedTest(test);
        setFormData({
            testName: test.testName || test.test_name || '',
            score: test.score || '',
            scoreImageFile: null,
            scoreImagePreview: test.scoreImage || test.score_image || null
        });
        setShowEditModal(true);
    };

    const handleUpdateTest = async () => {
        console.log('handleUpdateTest called');
        console.log('mentorId:', mentorId);
        console.log('selectedTest:', selectedTest);
        console.log('selectedTest?.id:', selectedTest?.id);
        console.log('formData:', formData);
        
        // Try to get ID from different possible properties
        const testId = selectedTest?.id || selectedTest?.testId || selectedTest?.test_id;
        console.log('Resolved testId:', testId);
        
        if (!mentorId || !testId) {
            console.error('Missing mentorId or testId');
            console.error('Available selectedTest keys:', selectedTest ? Object.keys(selectedTest) : 'selectedTest is null');
            showToast('Lỗi: Không tìm thấy thông tin mentor hoặc bài test', 'danger');
            return;
        }
        
        // Validate required fields
        if (!formData.testName || !formData.score) {
            showToast('Vui lòng điền đầy đủ tên bài test và điểm', 'warning');
            return;
        }
        
        try {
            setLoading(true);
            
            // Create FormData for multipart upload
            const formDataToSend = new FormData();
            formDataToSend.append('testName', formData.testName);
            formDataToSend.append('score', formData.score);
            if (formData.scoreImageFile) {
                formDataToSend.append('scoreImageFile', formData.scoreImageFile);
            }
            
            console.log('Sending update request with testId:', testId);
            const result = await MentorTestService.update(testId, mentorId, formDataToSend);
            console.log('Update successful:', result);
            
            await refreshTests();
            setShowEditModal(false);
            resetForm();
            showToast('Cập nhật bài test thành công!', 'success');
        } catch (e) {
            console.error('Update test failed', e);
            showToast('Cập nhật bài test thất bại: ' + (e.response?.data?.message || e.message), 'danger');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTest = async (testId) => {
        if (!mentorId) return;
        if (window.confirm('Bạn có chắc chắn muốn xóa bài test này?')) {
            try {
                setLoading(true);
                await MentorTestService.remove(testId, mentorId);
                await refreshTests();
                showToast('Xóa bài test thành công!', 'success');
            } catch (e) {
                console.error('Delete test failed', e);
                showToast('Xóa bài test thất bại: ' + (e.response?.data?.message || e.message), 'danger');
            } finally {
                setLoading(false);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            testName: '',
            score: '',
            scoreImageFile: null,
            scoreImagePreview: null
        });
        setSelectedTest(null);
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
                scoreImageFile: file,
                scoreImagePreview: previewUrl
            }));
        }
    };

    return (
        <div className="test-management">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="mb-1">Quản lý bài test</h3>
                    <p className="text-muted mb-0">Tạo và quản lý các bài test cho mentee</p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => setShowCreateModal(true)}
                    className="btn-mentor"
                >
                    <i className="bi bi-plus-circle me-2"></i>
                    Tạo bài test mới
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
                                <i className="bi bi-file-earmark-text"></i>
                            </div>
                            <div className="stat-value">{tests.length}</div>
                            <p className="stat-label">Tổng bài test</p>
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
                            <span className="filter-label" style={{color: "black"}}>Tất cả</span> <Badge bg={filterStatus==='ALL'?'light':'secondary'} text={filterStatus==='ALL'?'dark':'light'} className="ms-1">{tests.length}</Badge>
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
                            <th style={{minWidth: 220}}>Tên bài test</th>
                            <th style={{minWidth: 120}}>Điểm</th>
                            <th style={{minWidth: 180}}>Hình ảnh</th>
                            <th style={{minWidth: 140}}>Trạng thái</th>
                            <th style={{minWidth: 200}}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((test, index) => {
                            // Find the original test object from tests array to ensure we have all properties including ID
                            const fullTest = tests.find(t => 
                                (t.testName === test.testName || t.test_name === test.testName) &&
                                (t.score === test.score)
                            ) || test;
                            
                            
                            return (
                            <tr key={test.id || index}>
                                <td>
                                    <div className="fw-semibold">{test.testName || test.test_name}</div>
                                </td>
                                <td>
                                    <span className="badge bg-primary">{test.score || '--'}</span>
                                </td>
                                <td>
                                    {test.scoreImage || test.score_image ? (
                                        <a href={test.scoreImage || test.score_image} target="_blank" rel="noopener noreferrer" className="text-primary">
                                            <i className="bi bi-image me-1"></i> Xem ảnh
                                        </a>
                                    ) : (
                                        <span className="text-muted">Chưa có</span>
                                    )}
                                </td>
                                <td>
                                    <span className={`badge ${
                                        (test.statusCode || '').toUpperCase() === 'APPROVED' ? 'bg-success'
                                        : (test.statusCode || '').toUpperCase() === 'PENDING' ? 'bg-warning text-dark'
                                        : 'bg-secondary'
                                    }`}>
                                        {getStatusText(test.statusCode)}
                                    </span>
                                </td>
                                <td>
                                    <div className="d-flex gap-2">
                                        <Button variant="outline-secondary" size="sm" onClick={() => { setViewTest(fullTest); setShowViewModal(true); }}>
                                            <i className="bi bi-eye me-1"></i> Xem
                                        </Button>
                                        <Button variant="outline-primary" size="sm" onClick={() => handleEditTest(fullTest)}>
                                            <i className="bi bi-pencil me-1"></i> Cập nhật
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        )})}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center text-muted py-4">Không có bài test phù hợp</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>

            {/* Create Test Modal */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Tạo bài test mới</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Tên bài test <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                name="testName"
                                placeholder="Nhập tên bài test (VD: IELTS, SAT, TOEFL...)"
                                value={formData.testName}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Điểm <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                name="score"
                                placeholder="Nhập điểm (VD: 7.5, 1400, 110...)"
                                value={formData.score}
                                onChange={handleInputChange}
                            />
                            <Form.Text className="text-muted">
                                Nhập điểm số bạn đạt được trong bài test
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Hình ảnh chứng chỉ <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <Form.Text className="text-muted">
                                Chọn file hình ảnh chứng chỉ/kết quả test (jpg, png, gif - tối đa 5MB)
                            </Form.Text>
                        </Form.Group>

                        {formData.scoreImagePreview && (
                            <div className="mb-3">
                                <div className="border rounded p-2 bg-light">
                                    <small className="text-muted d-block mb-2">Xem trước hình ảnh:</small>
                                    <div className="text-center">
                                        <img 
                                            src={formData.scoreImagePreview} 
                                            alt="Preview" 
                                            style={{maxWidth: '100%', maxHeight: '300px', objectFit: 'contain'}}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <Alert variant="info">
                            <i className="bi bi-info-circle me-2"></i>
                            Sau khi tạo/cập nhật, bài test sẽ có trạng thái PENDING và chờ admin duyệt.
                        </Alert>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleCreateTest}
                        disabled={!formData.testName || !formData.score || !formData.scoreImageFile}
                    >
                        <i className="bi bi-plus me-2"></i>
                        Tạo bài test
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Edit Test Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Chỉnh sửa bài test</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Tên bài test <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                name="testName"
                                placeholder="Nhập tên bài test (VD: IELTS, SAT, TOEFL...)"
                                value={formData.testName}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Điểm <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                name="score"
                                placeholder="Nhập điểm (VD: 7.5, 1400, 110...)"
                                value={formData.score}
                                onChange={handleInputChange}
                            />
                            <Form.Text className="text-muted">
                                Nhập điểm số bạn đạt được trong bài test
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Hình ảnh chứng chỉ {!formData.scoreImagePreview && <span className="text-danger">*</span>}</Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <Form.Text className="text-muted">
                                {formData.scoreImagePreview ? 'Chọn file mới để thay đổi hình ảnh hiện tại' : 'Chọn file hình ảnh chứng chỉ (jpg, png, gif - tối đa 5MB)'}
                            </Form.Text>
                        </Form.Group>

                        {formData.scoreImagePreview && (
                            <div className="mb-3">
                                <div className="border rounded p-2 bg-light">
                                    <small className="text-muted d-block mb-2">
                                        {formData.scoreImageFile ? 'Xem trước hình ảnh mới:' : 'Hình ảnh hiện tại:'}
                                    </small>
                                    <div className="text-center">
                                        <img 
                                            src={formData.scoreImagePreview} 
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
                        onClick={handleUpdateTest}
                        disabled={loading || !formData.testName || !formData.score}
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
                    <Modal.Title>Chi tiết bài test</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {viewTest ? (
                        <div>
                            <div className="mb-3">
                                <strong>Tên bài test:</strong> 
                                <div className="mt-1 fs-5">{viewTest.testName || viewTest.test_name}</div>
                            </div>
                            
                            <div className="mb-3">
                                <strong>Điểm:</strong>
                                <div className="mt-1">
                                    <Badge bg="primary" className="fs-6 px-3 py-2">{viewTest.score || 'Chưa có'}</Badge>
                                </div>
                            </div>

                            <div className="mb-3">
                                <strong>Trạng thái:</strong>
                                <div className="mt-1">
                                    <span className={`badge ${
                                        (viewTest.statusCode || '').toUpperCase() === 'APPROVED' ? 'bg-success'
                                        : (viewTest.statusCode || '').toUpperCase() === 'PENDING' ? 'bg-warning text-dark'
                                        : 'bg-secondary'
                                    }`}>
                                        {getStatusText(viewTest.statusCode)}
                                    </span>
                                </div>
                            </div>

                            <div className="mb-3">
                                <strong>Hình ảnh chứng chỉ:</strong>
                                {viewTest.scoreImage || viewTest.score_image ? (
                                    <div className="mt-2 border rounded p-2">
                                        <img 
                                            src={viewTest.scoreImage || viewTest.score_image} 
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
                                            <a href={viewTest.scoreImage || viewTest.score_image} target="_blank" rel="noopener noreferrer">
                                                Xem trong tab mới <i className="bi bi-box-arrow-up-right ms-1"></i>
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-muted mt-2">Chưa có hình ảnh</div>
                                )}
                            </div>

                            <div className="text-muted small mt-4 pt-3 border-top">
                                <div><i className="bi bi-calendar me-1"></i> Tạo: {formatDateTime(viewTest.createdAt || viewTest.created_at)}</div>
                                {viewTest.updatedAt && <div><i className="bi bi-pencil me-1"></i> Cập nhật: {formatDateTime(viewTest.updatedAt)}</div>}
                            </div>
                        </div>
                    ) : 'Đang tải...'}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowViewModal(false)}>
                        Đóng
                    </Button>
                    {viewTest && (
                        <Button variant="primary" onClick={() => { setShowViewModal(false); handleEditTest(viewTest); }}>
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

export default MentorTestManagement;

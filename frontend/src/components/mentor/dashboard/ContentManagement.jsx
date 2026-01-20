import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Button, Table, Badge, Modal, Form, Alert, Tab, Nav, Spinner } from 'react-bootstrap';
import 'quill/dist/quill.snow.css';
import '../../../styles/components/quill-editor.css';
import { createBlog, updateBlog, getBlogsByMentor, deleteBlogByMentor } from '../../../services/blog';
import { instance } from '../../../api/axios';
import { extractTextFromHtml } from '../../../utils/htmlUtils';
import { API_ENDPOINTS } from '../../../utils';
import { AuthContext } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import RichTextEditor from '../../common/RichTextEditor';

const ContentManagement = () => {
    const { user } = useContext(AuthContext);
    const userId = user?.userId || user?.id; // unify token-derived user (userId) vs API user (id)
    const [resolvedUserId, setResolvedUserId] = useState(null);
    const { showToast } = useToast();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [activeTab, setActiveTab] = useState('blogs');
    const [loading, setLoading] = useState(false);
    const [blogs, setBlogs] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        size: 10,
        totalElements: 0,
        totalPages: 0
    });
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        isPublished: false
    });

    // Resolve user id from profile if token lacks userId
    useEffect(() => {
        const resolveId = async () => {
            try {
                if (!userId) {
                    const res = await instance.get(API_ENDPOINTS.USERS.PROFILE);
                    const data = res?.data || res;
                    if (data?.id) setResolvedUserId(data.id);
                }
            } catch (e) {
                console.error('Failed to resolve user id from profile', e);
            }
        };
        resolveId();
    }, [userId]);

    const effectiveUserId = userId || resolvedUserId;

    useEffect(() => {
        if (effectiveUserId) {
            fetchBlogs();
        }
    }, [effectiveUserId, pagination.page]);

    const toServerPage = (clientPage) => Math.max(0, (clientPage || 1) - 1);

    const fetchBlogs = async () => {
    if (!effectiveUserId) return;
        
        try {
            setLoading(true);
            const res = await getBlogsByMentor(effectiveUserId, {
                // Backend uses 0-based page index
                page: toServerPage(pagination.page),
                size: pagination.size
            });

            // Normalize possible response shapes from axios/backend
            // Possible shapes we may receive (examples):
            // 1) res = { requestDateTime, respCode, description, data: { pageNumber, blogs, ... } }
            // 2) res = { pageNumber, blogs, ... } (already inner data)
            // 3) res = axiosResponse (unlikely due to interceptor)
            let pagePayload = null;
            if (res && res.data && res.data.pageNumber !== undefined) {
                // shape 1: wrapper with .data
                pagePayload = res.data;
            } else if (res && res.pageNumber !== undefined) {
                // shape 2: inner data
                pagePayload = res;
            } else if (res && res.data && res.data.data) {
                // double-wrapped
                pagePayload = res.data.data;
            }

            if (pagePayload) {
                const { blogs = [], totalElements = 0, totalPages = 0, pageNumber = 0 } = pagePayload;
                console.debug('fetchBlogs: pagePayload', { pageNumber, totalElements, totalPages, blogsCount: Array.isArray(blogs) ? blogs.length : 0 });
                setBlogs(Array.isArray(blogs) ? blogs : []);
                setPagination(prev => ({
                    ...prev,
                    page: (pageNumber ?? 0) + 1,
                    totalElements,
                    totalPages
                }));
            } else {
                setBlogs([]);
            }
        } catch (error) {
            console.error('Error fetching blogs:', error);
            showToast('Không thể tải danh sách bài viết', 'error');
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const getStatusBadge = (statusName) => {
        if (!statusName) return <Badge bg="secondary">Không xác định</Badge>;
        
        const statusMap = {
            'Approved': { bg: 'success', text: 'Đã duyệt' },
            'Pending': { bg: 'warning', text: 'Chờ duyệt' },
            'Rejected': { bg: 'danger', text: 'Từ chối' },
        };
        const statusInfo = statusMap[statusName] || { bg: 'secondary', text: statusName };
        return <Badge bg={statusInfo.bg}>{statusInfo.text}</Badge>;
    };

    const handleCreateBlog = async () => {
        if (!effectiveUserId) {
            showToast('Không tìm thấy thông tin người dùng', 'error');
            return;
        }

        if (!formData.title.trim() || !formData.content.trim()) {
            showToast('Vui lòng điền đầy đủ thông tin', 'warning');
            return;
        }

        try {
            setLoading(true);
            const request = {
                title: formData.title,
                content: formData.content,
                isPublished: formData.isPublished || false
            };

            await createBlog(request, effectiveUserId);
            showToast('Tạo bài viết thành công! Bài viết đang chờ duyệt.', 'success');
            setShowCreateModal(false);
            resetForm();
            fetchBlogs();
        } catch (error) {
            console.error('Error creating blog:', error);
            const msg = error?.description || error?.message || error?.response?.data?.description || 'Không thể tạo bài viết';
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEditBlog = (blog) => {
        setSelectedBlog(blog);
        setFormData({
            title: blog.title,
            content: blog.content,
            isPublished: blog.isPublished || false
        });
        setShowEditModal(true);
    };

    const handleUpdateBlog = async () => {
        if (!effectiveUserId || !selectedBlog) {
            showToast('Không tìm thấy thông tin người dùng', 'error');
            return;
        }

        if (!formData.title.trim() || !formData.content.trim()) {
            showToast('Vui lòng điền đầy đủ thông tin', 'warning');
            return;
        }

        try {
            setLoading(true);
            const request = {
                title: formData.title,
                content: formData.content,
                isPublished: formData.isPublished || false
            };

            await updateBlog(selectedBlog.id, request, effectiveUserId);
            showToast('Cập nhật bài viết thành công! Bài viết sẽ được kiểm duyệt lại.', 'success');
            setShowEditModal(false);
            resetForm();
            fetchBlogs();
        } catch (error) {
            console.error('Error updating blog:', error);
            const msg = error?.description || error?.message || error?.response?.data?.description || 'Không thể cập nhật bài viết';
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBlog = async (blogId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
            return;
        }

        try {
            setLoading(true);
            await deleteBlogByMentor(blogId);
            showToast('Xóa bài viết thành công', 'success');
            fetchBlogs();
        } catch (error) {
            console.error('Error deleting blog:', error);
            const msg = error?.description || error?.message || error?.response?.data?.description || 'Không thể xóa bài viết';
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            content: '',
            isPublished: false
        });
        setSelectedBlog(null);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleContentChange = (value) => {
        setFormData(prev => ({
            ...prev,
            content: value
        }));
    };

    return (
        <div className="content-management">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="mb-1">Quản lý nội dung</h3>
                    <p className="text-muted mb-0">Tạo và chia sẻ các bài viết, blog để giúp đỡ cộng đồng</p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => setShowCreateModal(true)}
                    className="btn-mentor"
                >
                    <i className="bi bi-plus-circle me-2"></i>
                    Tạo blog
                </Button>
            </div>

            {/* Statistics Cards */}
            <Row className="mb-4">
                <Col lg={3} md={6} className="mb-3">
                    <Card className="dashboard-card stat-card">
                        <Card.Body>
                            <div className="stat-icon primary">
                                <i className="bi bi-journal-text"></i>
                            </div>
                            <div className="stat-value">{blogs.length}</div>
                            <p className="stat-label">Tổng bài viết</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                    <Card className="dashboard-card stat-card">
                        <Card.Body>
                            <div className="stat-icon success">
                                <i className="bi bi-check-circle"></i>
                            </div>
                            <div className="stat-value">{blogs.filter(b => b.statusName === 'Approved').length}</div>
                            <p className="stat-label">Đã duyệt</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                    <Card className="dashboard-card stat-card">
                        <Card.Body>
                            <div className="stat-icon info">
                                <i className="bi bi-eye"></i>
                            </div>
                            <div className="stat-value">
                                {blogs.reduce((sum, b) => sum + (b.viewCount || 0), 0)}
                            </div>
                            <p className="stat-label">Lượt xem</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                    <Card className="dashboard-card stat-card">
                        <Card.Body>
                            <div className="stat-icon warning">
                                <i className="bi bi-clock-history"></i>
                            </div>
                            <div className="stat-value">{blogs.filter(b => b.statusName === 'Pending').length}</div>
                            <p className="stat-label">Chờ duyệt</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Content Tabs */}
            <Card className="dashboard-card">
                <Card.Header className="bg-transparent border-0">
                    <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
                        <Nav variant="tabs" className="content-tabs">
                            <Nav.Item>
                                <Nav.Link eventKey="blogs">
                                    <i className="bi bi-journal-text me-2"></i>
                                    Bài viết Blog
                                </Nav.Link>
                            </Nav.Item>
                            
                        </Nav>
                    </Tab.Container>
                </Card.Header>
                <Card.Body className="p-0">
                    <Tab.Container activeKey={activeTab}>
                        <Tab.Content>
                            <Tab.Pane eventKey="blogs">
                                {loading ? (
                                    <div className="text-center py-5">
                                        <Spinner animation="border" variant="primary" />
                                        <p className="mt-3 text-muted">Đang tải dữ liệu...</p>
                                    </div>
                                ) : blogs.length === 0 ? (
                                    <div className="text-center py-5">
                                        <i className="bi bi-journal-x display-1 text-muted"></i>
                                        <h5 className="mt-3 text-muted">Chưa có bài viết nào</h5>
                                        <p className="text-muted">Hãy tạo bài viết đầu tiên của bạn!</p>
                                        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                                            <i className="bi bi-plus-circle me-2"></i>
                                            Viết bài mới
                                        </Button>
                                    </div>
                                ) : (
                                    <Table className="custom-table">
                                        <thead>
                                            <tr>
                                                <th>Tiêu đề</th>
                                                <th>Trạng thái</th>
                                                <th>Xuất bản</th>
                                                <th>Lượt xem</th>
                                                <th>Ngày tạo</th>
                                                <th>Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {blogs.map((blog) => (
                                                <tr key={blog.id}>
                                                    <td>
                                                        <div>
                                                            <div className="fw-medium">{blog.title}</div>
                                                            <small className="text-muted">
                                                                {extractTextFromHtml(blog.content, 100)}
                                                                {blog.content ? blog.content.replace(/<[^>]*>/g, '').substring(0, 100) : ''}...
                                                            </small>
                                                        </div>
                                                    </td>
                                                    <td>{getStatusBadge(blog.statusName)}</td>
                                                    <td>
                                                        {blog.isPublished ? (
                                                            <Badge bg="success">Công khai</Badge>
                                                        ) : (
                                                            <Badge bg="secondary">Riêng tư</Badge>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <i className="bi bi-eye me-1 text-muted"></i>
                                                            {(blog.viewCount || 0).toLocaleString()}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <small>{formatDateTime(blog.createdAt)}</small>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex gap-1">
                                                            <Button
                                                                variant="outline-primary"
                                                                size="sm"
                                                                onClick={() => handleEditBlog(blog)}
                                                                disabled={loading}
                                                            >
                                                                <i className="bi bi-pencil"></i>
                                                            </Button>
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                onClick={() => handleDeleteBlog(blog.id)}
                                                                disabled={loading}
                                                            >
                                                                <i className="bi bi-trash"></i>
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                )}
                            </Tab.Pane>
                            <Tab.Pane eventKey="guides">
                                <div className="text-center py-5">
                                    <i className="bi bi-book display-1 text-muted"></i>
                                    <h5 className="mt-3 text-muted">Tính năng đang phát triển</h5>
                                    <p className="text-muted">Tính năng quản lý hướng dẫn sẽ được cập nhật trong phiên bản tiếp theo</p>
                                </div>
                            </Tab.Pane>
                        </Tab.Content>
                    </Tab.Container>
                </Card.Body>
            </Card>

            {/* Popular Posts */}
            <Row className="mt-4">
                
                <Col lg={6}>
                    <Card className="dashboard-card">
                        <Card.Header className="bg-transparent border-0">
                            <h5 className="mb-0">Thống kê nội dung</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="content-stats">
                                <div className="stat-row d-flex justify-content-between align-items-center mb-3">
                                    <span>Đã duyệt:</span>
                                    <span className="fw-bold text-success">
                                        {blogs.filter(b => b.statusName === 'Approved').length}
                                    </span>
                                </div>
                                <div className="stat-row d-flex justify-content-between align-items-center mb-3">
                                    <span>Đang chờ duyệt:</span>
                                    <span className="fw-bold text-warning">
                                        {blogs.filter(b => b.statusName === 'Pending').length}
                                    </span>
                                </div>
                                <div className="stat-row d-flex justify-content-between align-items-center mb-3">
                                    <span>Bị từ chối:</span>
                                    <span className="fw-bold text-danger">
                                        {blogs.filter(b => b.statusName === 'Rejected').length}
                                    </span>
                                </div>
                                <div className="stat-row d-flex justify-content-between align-items-center mb-3">
                                    <span>Tổng lượt xem:</span>
                                    <span className="fw-bold text-primary">
                                        {blogs.reduce((sum, b) => sum + (b.viewCount || 0), 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="stat-row d-flex justify-content-between align-items-center">
                                    <span>Trung bình lượt xem/bài:</span>
                                    <span className="fw-bold text-info">
                                        {blogs.length > 0 ? Math.round(blogs.reduce((sum, b) => sum + (b.viewCount || 0), 0) / blogs.length) : 0}
                                    </span>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Create Blog Modal */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Viết bài mới</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Tiêu đề <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                name="title"
                                placeholder="Nhập tiêu đề bài viết"
                                value={formData.title}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Nội dung <span className="text-danger">*</span></Form.Label>
                            <div className="quill-editor-wrapper">
                                <RichTextEditor
                                    value={formData.content}
                                    onChange={handleContentChange}
                                    placeholder="Viết nội dung bài viết của bạn..."
                                />
                            </div>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                name="isPublished"
                                label="Công khai bài viết (hiển thị trên trang chủ khi được duyệt)"
                                checked={formData.isPublished}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Alert variant="info">
                            <i className="bi bi-info-circle me-2"></i>
                            <strong>Lưu ý:</strong> Bài viết sẽ được kiểm duyệt trước khi xuất bản công khai.
                            Quá trình này có thể mất 1-2 ngày làm việc.
                        </Alert>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCreateModal(false)} disabled={loading}>
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleCreateBlog}
                        disabled={!formData.title || !formData.content || loading}
                    >
                        {loading ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-save me-2"></i>
                                Tạo bài viết
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Edit Blog Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Chỉnh sửa bài viết</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Tiêu đề <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                name="title"
                                placeholder="Nhập tiêu đề bài viết"
                                value={formData.title}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Nội dung <span className="text-danger">*</span></Form.Label>
                            <div className="quill-editor-wrapper">
                                <RichTextEditor
                                    value={formData.content}
                                    onChange={handleContentChange}
                                    placeholder="Viết nội dung bài viết của bạn..."
                                />
                            </div>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                name="isPublished"
                                label="Công khai bài viết (hiển thị trên trang chủ khi được duyệt)"
                                checked={formData.isPublished}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Alert variant="warning">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            <strong>Lưu ý:</strong> Khi cập nhật bài viết, trạng thái sẽ được đặt lại về "Chờ duyệt" 
                            và cần được kiểm duyệt lại trước khi xuất bản.
                        </Alert>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)} disabled={loading}>
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleUpdateBlog}
                        disabled={!formData.title || !formData.content || loading}
                    >
                        {loading ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Đang xử lý...
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

            <style jsx>{`
                .content-tabs .nav-link {
                    color: var(--text-color);
                    border-bottom: 2px solid transparent;
                }
                
                .content-tabs .nav-link.active {
                    color: var(--primary-color);
                    border-bottom-color: var(--primary-color);
                    background: none;
                }
                
                .content-tabs .nav-link:hover {
                    color: var(--primary-color);
                    border-bottom-color: rgba(113, 201, 206, 0.3);
                }
                
                .rank-badge {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    font-size: 0.8rem;
                }
                
                .rank-1 {
                    background: linear-gradient(135deg, #ffd700, #ffed4e);
                }
                
                .rank-2 {
                    background: linear-gradient(135deg, #c0c0c0, #e8e8e8);
                }
                
                .rank-3 {
                    background: linear-gradient(135deg, #cd7f32, #d4af37);
                }
                
                .popular-post-item {
                    padding: 0.75rem 0;
                    border-bottom: 1px solid var(--border-color);
                }
                
                .popular-post-item:last-child {
                    border-bottom: none;
                }
                
                .content-stats {
                    background-color: rgba(113, 201, 206, 0.05);
                    border-radius: 10px;
                    padding: 1rem;
                }
                
                .stat-row {
                    padding: 0.5rem 0;
                    border-bottom: 1px solid rgba(113, 201, 206, 0.1);
                }
                
                .stat-row:last-child {
                    border-bottom: none;
                }
            `}</style>
        </div>
    );
};

export default ContentManagement;
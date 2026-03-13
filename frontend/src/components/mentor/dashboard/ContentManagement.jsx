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
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;
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

    // Filter blogs theo status
    const getFilteredBlogs = () => {
        if (filterStatus === 'all') return blogs;
        return blogs.filter(blog => {
            if (filterStatus === 'approved') return blog.statusName === 'Approved';
            if (filterStatus === 'pending') return blog.statusName === 'Pending';
            if (filterStatus === 'rejected') return blog.statusName === 'Rejected';
            return true;
        });
    };

    // Phân trang
    const handleFilterChange = (newFilter) => {
        setFilterStatus(newFilter);
        setCurrentPage(1);
    };

    const getFilteredAndPaginatedBlogs = () => {
        const filtered = getFilteredBlogs();
        const totalPages = Math.ceil(filtered.length / recordsPerPage);
        const startIndex = (currentPage - 1) * recordsPerPage;
        const paginatedBlogs = filtered.slice(startIndex, startIndex + recordsPerPage);
        
        return {
            blogs: paginatedBlogs,
            filtered: filtered,
            totalPages: totalPages,
            startIndex: startIndex,
            totalRecords: filtered.length
        };
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


            {/* Content Tabs - Style giống Service Management */}
            <Card className="dashboard-card">
                <Card.Header className="bg-transparent border-0">
                    <style>{`
                        .status-filter .nav-link {
                            border: 2px solid #e0e0e0;
                            border-radius: 8px;
                            font-weight: 500;
                            transition: all 0.3s ease;
                            color: #000 !important;
                        }
                        .status-filter .nav-link:hover {
                            border-color: #71c9ce;
                            box-shadow: 0 2px 8px rgba(113, 201, 206, 0.2);
                            transform: translateY(-1px);
                            color: #000 !important;
                        }
                        .status-filter .nav-link.active {
                            border-color: #ffc107;
                            background-color: #ffc107;
                            box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
                            color: #000 !important;
                        }
                        .compact-table {
                            font-size: 0.9rem;
                        }
                        .compact-table th {
                            background-color: #f8f9fa;
                            font-weight: 600;
                            padding: 12px 8px;
                            border-bottom: 2px solid #dee2e6;
                        }
                        .compact-table td {
                            padding: 10px 8px;
                            vertical-align: middle;
                        }
                        .compact-table tbody tr:hover {
                            background-color: #f8f9fa;
                        }
                        .blog-title {
                            font-weight: 600;
                            color: #2c3e50;
                            margin-bottom: 4px;
                        }
                        .blog-excerpt {
                            color: #6c757d;
                            font-size: 0.85rem;
                            display: -webkit-box;
                            -webkit-line-clamp: 2;
                            -webkit-box-orient: vertical;
                            overflow: hidden;
                            line-height: 1.4;
                        }
                    `}</style>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <Nav variant="pills" className="gap-2 flex-wrap status-filter">
                            <Nav.Item>
                                <Nav.Link 
                                    active={filterStatus === 'all'} 
                                    onClick={() => handleFilterChange('all')}
                                >
                                    <span className="filter-label" style={{color: "black"}}>Tất cả</span>
                                    <Badge bg={filterStatus==='all'?'light':'secondary'} text={filterStatus==='all'?'dark':'light'} className="ms-1">
                                        {blogs.length}
                                    </Badge>
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link 
                                    active={filterStatus === 'approved'} 
                                    onClick={() => handleFilterChange('approved')}
                                >
                                    <span className="filter-label" style={{color: "black"}}>Đã duyệt</span>
                                    <Badge bg="success" text="dark" className="ms-1">
                                        {blogs.filter(b => b.statusName === 'Approved').length}
                                    </Badge>
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link 
                                    active={filterStatus === 'pending'} 
                                    onClick={() => handleFilterChange('pending')}
                                >
                                    <span className="filter-label" style={{color: "black"}}>Chờ duyệt</span>
                                    <Badge bg="warning" text="dark" className="ms-1">
                                        {blogs.filter(b => b.statusName === 'Pending').length}
                                    </Badge>
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link 
                                    active={filterStatus === 'rejected'} 
                                    onClick={() => handleFilterChange('rejected')}
                                >
                                    <span className="filter-label" style={{color: "black"}}>Từ chối</span>
                                    <Badge bg="secondary" className="ms-1">
                                        {blogs.filter(b => b.statusName === 'Rejected').length}
                                    </Badge>
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                        <div className="d-flex align-items-center gap-2 text-muted small">
                            {getFilteredBlogs().length} bài viết
                        </div>
                    </div>
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
                                ) : (() => {
                                    const paginationData = getFilteredAndPaginatedBlogs();
                                    return (
                                        <>
                                            <Table className="compact-table" hover responsive>
                                                <thead>
                                                    <tr>
                                                        <th style={{minWidth: '300px'}}>Tiêu đề</th>
                                                        <th style={{width: '120px'}}>Trạng thái</th>
                                                        <th style={{width: '100px'}}>Xuất bản</th>
                                                        <th style={{width: '100px'}}>Lượt xem</th>
                                                        <th style={{width: '150px'}}>Ngày tạo</th>
                                                        <th style={{width: '120px'}}>Thao tác</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {paginationData.blogs.map((blog) => (
                                                <tr key={blog.id}>
                                                    <td>
                                                        <div className="blog-title">{blog.title}</div>
                                                        <div className="blog-excerpt">
                                                            {extractTextFromHtml(blog.content, 100)}
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
                                            
                                            {/* Pagination Controls */}
                                            {paginationData.totalPages > 1 && (
                                                <div className="d-flex justify-content-between align-items-center p-3 border-top bg-light">
                                                    <div className="text-muted small">
                                                        Trang {currentPage} / {paginationData.totalPages}
                                                        <span className="ms-3">
                                                            Hiển thị {paginationData.startIndex + 1} - {Math.min(paginationData.startIndex + recordsPerPage, paginationData.totalRecords)} / {paginationData.totalRecords} bài viết
                                                        </span>
                                                    </div>
                                                    <div className="d-flex gap-2">
                                                        <Button
                                                            variant="outline-secondary"
                                                            size="sm"
                                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                            disabled={currentPage === 1}
                                                        >
                                                            <i className="bi bi-chevron-left"></i>
                                                        </Button>
                                                        
                                                        <div className="d-flex gap-1">
                                                            {Array.from({ length: paginationData.totalPages }, (_, i) => i + 1).map(page => (
                                                                <Button
                                                                    key={page}
                                                                    variant={currentPage === page ? "warning" : "outline-secondary"}
                                                                    size="sm"
                                                                    onClick={() => setCurrentPage(page)}
                                                                    className="px-2"
                                                                >
                                                                    {page}
                                                                </Button>
                                                            ))}
                                                        </div>
                                                        
                                                        <Button
                                                            variant="outline-secondary"
                                                            size="sm"
                                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, paginationData.totalPages))}
                                                            disabled={currentPage === paginationData.totalPages}
                                                        >
                                                            <i className="bi bi-chevron-right"></i>
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
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
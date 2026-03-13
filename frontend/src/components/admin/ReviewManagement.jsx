import React, { useState, useEffect } from 'react';
import {
    Card, Row, Col, Table, Button, Badge, Form, Dropdown,
    InputGroup, Modal, Spinner, Pagination, Alert
} from 'react-bootstrap';
import { FaSearch, FaCheck, FaTimes, FaCommentDots, FaFlag } from 'react-icons/fa';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { useToast } from '../../contexts/ToastContext';
import {
    getAllReviews,
    getReviewById,
    publishReview,
    unpublishReview,
    deleteReview
} from '../../services/admin';

const ReviewManagement = () => {
    const [reviews, setReviews] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRating, setFilterRating] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 10,
        totalPages: 0,
        totalElements: 0
    });

    const { showToast } = useToast();

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return '';
        try {
            return new Date(dateTimeString).toLocaleString('vi-VN');
        } catch {
            return dateTimeString;
        }
    };

    const getRatingStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <span key={i} className={i < rating ? 'text-warning' : 'text-muted'}>★</span>
        ));
    };

    const getStatusBadgeVariant = (isPublished, isReported) => {
        if (isReported) return 'danger';
        if (isPublished) return 'success';
        return 'warning';
    };

    const getStatusText = (isPublished, isReported) => {
        if (isReported) return 'Bị báo cáo';
        if (isPublished) return 'Đã xuất bản';
        return 'Chờ duyệt';
    };

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const resp = await getAllReviews({
                keySearch: searchTerm || null,
                rating: filterRating || null,
                status: filterStatus || null,
                page: pagination.currentPage,
                size: pagination.pageSize
            });
            if (resp && resp.respCode === '0') {
                setReviews(resp.data.content || []);
                setPagination(prev => ({
                    ...prev,
                    totalPages: resp.data.totalPages || 0,
                    totalElements: resp.data.totalElements || 0
                }));
            } else {
                showToast('error', (resp && resp.description) || 'Không thể tải danh sách đánh giá');
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            showToast('error', 'Có lỗi xảy ra khi tải danh sách đánh giá');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const t = setTimeout(() => fetchReviews(), searchTerm ? 400 : 0);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.currentPage, searchTerm, filterRating, filterStatus]);

    const handleViewReviewById = async (id) => {
        try {
            const resp = await getReviewById(id);
            if (resp && resp.respCode === '0') {
                setSelectedReview(resp.data);
                setShowModal(true);
            } else {
                showToast('error', (resp && resp.description) || 'Không thể tải thông tin đánh giá');
            }
        } catch (error) {
            console.error('Error fetching review details:', error);
            showToast('error', 'Có lỗi xảy ra khi tải thông tin đánh giá');
        }
    };

    const handlePublishReview = async (id) => {
        try {
            const resp = await publishReview(id);
            if (resp && resp.respCode === '0') {
                showToast('success', 'Xuất bản đánh giá thành công');
                fetchReviews();
            } else {
                showToast('error', (resp && resp.description) || 'Không thể xuất bản đánh giá');
            }
        } catch (error) {
            console.error('Error publishing review:', error);
            showToast('error', 'Có lỗi xảy ra khi xuất bản đánh giá');
        }
    };

    const handleUnpublishReview = async (id) => {
        try {
            const resp = await unpublishReview(id);
            if (resp && resp.respCode === '0') {
                showToast('success', 'Ẩn đánh giá thành công');
                fetchReviews();
            } else {
                showToast('error', (resp && resp.description) || 'Không thể ẩn đánh giá');
            }
        } catch (error) {
            console.error('Error unpublishing review:', error);
            showToast('error', 'Có lỗi xảy ra khi ẩn đánh giá');
        }
    };

    const handleDeleteReview = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;
        try {
            const resp = await deleteReview(id);
            if (resp && resp.respCode === '0') {
                showToast('success', 'Xóa đánh giá thành công');
                fetchReviews();
                setShowModal(false);
            } else {
                showToast('error', (resp && resp.description) || 'Không thể xóa đánh giá');
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            showToast('error', 'Có lỗi xảy ra khi xóa đánh giá');
        }
    };

    return (
        <div>
            <h4>Quản lý đánh giá & review</h4>
            <Card className="mb-3">
                <Card.Body>
                    <Row className="g-2 align-items-center">
                        <Col md={4}>
                            <InputGroup>
                                <Form.Control
                                    placeholder="Tìm kiếm theo tên, nội dung..."
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setPagination(p => ({ ...p, currentPage: 1 })); }}
                                />
                                <Button variant="light" onClick={() => setSearchTerm('')}>
                                    <FaSearch />
                                </Button>
                            </InputGroup>
                        </Col>
                        <Col md={3}>
                            <Form.Select value={filterRating} onChange={(e) => { setFilterRating(e.target.value); setPagination(p => ({ ...p, currentPage: 1 })); }}>
                                <option value="">Tất cả đánh giá</option>
                                <option value="5">5 sao</option>
                                <option value="4">4 sao</option>
                                <option value="3">3 sao</option>
                                <option value="2">2 sao</option>
                                <option value="1">1 sao</option>
                            </Form.Select>
                        </Col>
                        <Col md={3}>
                            <Form.Select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPagination(p => ({ ...p, currentPage: 1 })); }}>
                                <option value="">Tất cả trạng thái</option>
                                <option value="published">Đã xuất bản</option>
                                <option value="pending">Chờ duyệt</option>
                            </Form.Select>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Card>
                <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">Danh sách đánh giá ({pagination.totalElements})</h6>
                    <span className="text-muted">Trang {pagination.currentPage}/{pagination.totalPages || 1}</span>
                </Card.Header>
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" />
                            <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="text-center py-5">
                            <FaCommentDots size={48} className="text-muted mb-3" />
                            <p className="text-muted">Không có đánh giá nào</p>
                        </div>
                    ) : (
                        <Table responsive hover className="mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th width="5%">ID</th>
                                    <th width="15%">Khách hàng</th>
                                    <th width="15%">Mentor</th>
                                    <th width="10%">Đánh giá</th>
                                    <th width="35%">Nội dung</th>
                                    <th width="10%">Trạng thái</th>
                                    <th width="10%">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reviews.map((review, idx) => (
                                    <tr key={review.id}>
                                        <td>{(pagination.currentPage - 1) * pagination.pageSize + idx + 1}</td>
                                        <td><div className="fw-medium">{review.customerName}</div></td>
                                        <td><div className="fw-medium">{review.mentorName}</div></td>
                                        <td className="text-center"><div className="mb-1">{getRatingStars(review.rating)}</div><div className="fw-medium">{review.rating}/5</div></td>
                                        <td><div className="review-preview">{review.comment && review.comment.length > 120 ? `${review.comment.substring(0, 120)}...` : review.comment}</div></td>
                                        <td><Badge bg={getStatusBadgeVariant(review.isPublished, review.isReported)}>{getStatusText(review.isPublished, review.isReported)}</Badge></td>
                                        <td>
                                            <Dropdown align="end" className="text-end">
                                                <Dropdown.Toggle variant="light" size="sm" className="no-caret p-1"><BsThreeDotsVertical /></Dropdown.Toggle>
                                                <Dropdown.Menu>
                                                    <Dropdown.Item onClick={() => handleViewReviewById(review.id)}>Xem</Dropdown.Item>
                                                    {!review.isPublished && !review.isReported && (<Dropdown.Item onClick={() => handlePublishReview(review.id)}>Duyệt</Dropdown.Item>)}
                                                    {review.isPublished && (<Dropdown.Item onClick={() => handleUnpublishReview(review.id)}>Ẩn đánh giá</Dropdown.Item>)}
                                                    <Dropdown.Divider />
                                                    <Dropdown.Item className="text-danger" onClick={() => handleDeleteReview(review.id)}>Xóa</Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>

                {!loading && reviews.length > 0 && (
                    <Card.Footer className="bg-light">
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="text-muted">Hiển thị {((pagination.currentPage - 1) * pagination.pageSize) + 1} - {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalElements)} trong tổng số {pagination.totalElements} đánh giá</div>
                            <Pagination className="mb-0">
                                <Pagination.Prev disabled={pagination.currentPage === 1} onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage - 1 }))} />
                                {pagination.currentPage > 2 && (<><Pagination.Item onClick={() => setPagination(p => ({ ...p, currentPage: 1 }))}>1</Pagination.Item>{pagination.currentPage > 3 && <Pagination.Ellipsis disabled />}</>)}
                                {pagination.currentPage > 1 && <Pagination.Item onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage - 1 }))}>{pagination.currentPage - 1}</Pagination.Item>}
                                <Pagination.Item active>{pagination.currentPage}</Pagination.Item>
                                {pagination.currentPage < pagination.totalPages && <Pagination.Item onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage + 1 }))}>{pagination.currentPage + 1}</Pagination.Item>}
                                {pagination.currentPage < pagination.totalPages - 1 && (<>{pagination.currentPage < pagination.totalPages - 2 && <Pagination.Ellipsis disabled /> }<Pagination.Item onClick={() => setPagination(p => ({ ...p, currentPage: pagination.totalPages }))}>{pagination.totalPages}</Pagination.Item></>)}
                                <Pagination.Next disabled={pagination.currentPage === pagination.totalPages} onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage + 1 }))} />
                            </Pagination>
                        </div>
                    </Card.Footer>
                )}
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Quản lý đánh giá & review</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedReview && (
                        <div>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <h6>Thông tin khách hàng</h6>
                                    <div className="mb-2">
                                        <div><strong>Tên:</strong> {selectedReview.customerName}</div>
                                        <div><strong>Email:</strong> {selectedReview.customerEmail}</div>
                                    </div>

                                    {(selectedReview.customerBankAccountNumber || selectedReview.customerBankAccount || selectedReview.customerBankNumber) ? (
                                        <div className="mb-2">
                                            <div className="fw-semibold">STK khách hàng</div>
                                            <div>{selectedReview.customerBankAccountNumber || selectedReview.customerBankAccount || selectedReview.customerBankNumber}</div>
                                            {selectedReview.customerBankName && <div className="text-muted small">{selectedReview.customerBankName}</div>}
                                        </div>
                                    ) : null}
                                </Col>
                                <Col md={6}>
                                    <h6>Thông tin mentor & dịch vụ</h6>
                                    <div className="mb-2">
                                        <div><strong>Mentor:</strong> {selectedReview.mentorName}</div>
                                        <div><strong>Dịch vụ:</strong> {selectedReview.service || 'N/A'}</div>
                                        <div><strong>Ngày đánh giá:</strong> {formatDateTime(selectedReview.createdAt)}</div>
                                    </div>

                                    {(selectedReview.mentorBankAccountNumber || selectedReview.mentorBankAccount || selectedReview.mentorBankNumber) ? (
                                        <div className="mb-2">
                                            <div className="fw-semibold">STK mentor</div>
                                            <div>{selectedReview.mentorBankAccountNumber || selectedReview.mentorBankAccount || selectedReview.mentorBankNumber}</div>
                                            {selectedReview.mentorBankName && <div className="text-muted small">{selectedReview.mentorBankName}</div>}
                                        </div>
                                    ) : null}
                                </Col>
                            </Row>

                            <div className="mb-3">
                                <h6>Đánh giá</h6>
                                <div className="d-flex align-items-center mb-2">
                                    <div className="me-3">{getRatingStars(selectedReview.rating)}</div>
                                    <span className="fw-medium">{selectedReview.rating}/5 sao</span>
                                </div>
                            </div>

                            <div className="mb-3">
                                <h6>Nội dung đánh giá</h6>
                                <div className="p-3 bg-light rounded">{selectedReview.comment}</div>
                            </div>

                            <div className="mb-3">
                                <h6>Trạng thái</h6>
                                <Badge bg={getStatusBadgeVariant(selectedReview.isPublished, selectedReview.isReported)} className="me-2">{getStatusText(selectedReview.isPublished, selectedReview.isReported)}</Badge>
                                {selectedReview.moderationNote && (<div className="mt-2"><small className="text-muted"><strong>Ghi chú kiểm duyệt:</strong> {selectedReview.moderationNote}</small></div>)}
                            </div>

                            {selectedReview.isReported && (
                                <div className="mb-3">
                                    <h6><FaFlag className="me-2" />Đánh giá bị báo cáo</h6>
                                    <p><strong>Lý do:</strong> {selectedReview.reportReason || 'Không rõ'}</p>
                                    <div className="mt-2">
                                        <Button variant="success" size="sm" className="me-2" onClick={() => { handlePublishReview(selectedReview.id); setShowModal(false); }}><FaCheck className="me-1" />Chấp nhận đánh giá</Button>
                                        <Button variant="danger" size="sm" onClick={() => handleDeleteReview(selectedReview.id)}><FaTimes className="me-1" />Xóa đánh giá</Button>
                                    </div>
                                </div>
                            )}

                            

                            {selectedReview.isPublished && !selectedReview.isReported && (
                                <div className="mb-3">
                                    <strong>Đánh giá đã được xuất bản</strong>
                                    <div className="mt-2">
                                        <Button variant="warning" size="sm" onClick={() => { handleUnpublishReview(selectedReview.id); setShowModal(false); }}><FaTimes className="me-1" />Ẩn đánh giá</Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Đóng</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ReviewManagement;
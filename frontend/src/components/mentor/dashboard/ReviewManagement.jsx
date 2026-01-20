import React, { useState } from 'react';
import { Row, Col, Card, Button, Table, Badge, Modal, Form, Alert } from 'react-bootstrap';

const ReviewManagement = () => {
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [replyText, setReplyText] = useState('');

    // Mock data cho reviews
    const reviews = [
        {
            id: 1,
            booking_id: 4,
            customer: {
                id: 4,
                fullname: 'Phạm Văn Nam',
                email: 'nam.pham@email.com'
            },
            service: 'Tư vấn du học',
            rating: 5,
            comment: 'Mentor rất nhiệt tình và có kinh nghiệm! Đã giúp tôi hiểu rõ hơn về quá trình xin visa du học Canada. Cảm ơn mentor rất nhiều!',
            isPublished: true,
            created_at: '2024-01-11T15:30:00',
            mentorReply: null
        },
        {
            id: 2,
            booking_id: 6,
            customer: {
                id: 6,
                fullname: 'Nguyễn Thị Hoa',
                email: 'hoa.nguyen@email.com'
            },
            service: 'Hướng nghiệp',
            rating: 4,
            comment: 'Mentor tư vấn khá tốt, giúp tôi định hướng được con đường career. Tuy nhiên, có một số câu hỏi chưa được giải đáp đầy đủ.',
            isPublished: true,
            created_at: '2024-01-08T10:20:00',
            mentorReply: {
                content: 'Cảm ơn bạn đã feedback! Tôi sẽ chuẩn bị kỹ hơn cho những buổi tư vấn tiếp theo.',
                created_at: '2024-01-08T16:45:00'
            }
        },
        {
            id: 3,
            booking_id: 7,
            customer: {
                id: 7,
                fullname: 'Trần Minh Khôi',
                email: 'khoi.tran@email.com'
            },
            service: 'Luyện thi IELTS',
            rating: 5,
            comment: 'Excellent mentor! Phương pháp học rất hiệu quả, tôi đã cải thiện được band điểm Speaking từ 6.0 lên 7.5. Highly recommended!',
            isPublished: false,
            created_at: '2024-01-05T14:15:00',
            mentorReply: null
        },
        {
            id: 4,
            booking_id: 8,
            customer: {
                id: 8,
                fullname: 'Lê Thị Bình',
                email: 'binh.le@email.com'
            },
            service: 'Tư vấn du học',
            rating: 3,
            comment: 'Mentor có kiến thức tốt nhưng thời gian tư vấn hơi ngắn. Mong mentor có thể dành nhiều thời gian hơn cho từng học viên.',
            isPublished: true,
            created_at: '2024-01-03T09:30:00',
            mentorReply: null
        }
    ];

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const handleReplyReview = (review) => {
        setSelectedReview(review);
        setShowReplyModal(true);
    };

    const handleSubmitReply = () => {
        console.log('Replying to review:', selectedReview.id, 'with:', replyText);
        // Logic gửi phản hồi
        setShowReplyModal(false);
        setSelectedReview(null);
        setReplyText('');
    };

    const handleTogglePublish = (reviewId, currentStatus) => {
        console.log('Toggle publish status for review:', reviewId, 'to:', !currentStatus);
        // Logic toggle trạng thái publish
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <i
                key={index}
                className={`bi bi-star${index < rating ? '-fill' : ''} text-warning`}
            />
        ));
    };

    const getAverageRating = () => {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        return (totalRating / reviews.length).toFixed(1);
    };

    const getRatingDistribution = () => {
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(review => {
            distribution[review.rating]++;
        });
        return distribution;
    };

    const ratingDistribution = getRatingDistribution();
    const totalReviews = reviews.length;

    return (
        <div className="review-management">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="mb-1">Quản lý đánh giá</h3>
                    <p className="text-muted mb-0">Xem và phản hồi các đánh giá từ học viên</p>
                </div>
                <div className="d-flex gap-2">
                    <Button variant="outline-primary">
                        <i className="bi bi-funnel me-2"></i>
                        Lọc đánh giá
                    </Button>
                    <Button variant="outline-secondary">
                        <i className="bi bi-download me-2"></i>
                        Xuất báo cáo
                    </Button>
                </div>
            </div>

            {/* Statistics Row */}
            <Row className="mb-4">
                <Col lg={3} md={6} className="mb-3">
                    <Card className="dashboard-card stat-card">
                        <Card.Body>
                            <div className="stat-icon primary">
                                <i className="bi bi-star"></i>
                            </div>
                            <div className="stat-value">{getAverageRating()}</div>
                            <p className="stat-label">Đánh giá trung bình</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                    <Card className="dashboard-card stat-card">
                        <Card.Body>
                            <div className="stat-icon success">
                                <i className="bi bi-chat-square-text"></i>
                            </div>
                            <div className="stat-value">{totalReviews}</div>
                            <p className="stat-label">Tổng đánh giá</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                    <Card className="dashboard-card stat-card">
                        <Card.Body>
                            <div className="stat-icon warning">
                                <i className="bi bi-eye"></i>
                            </div>
                            <div className="stat-value">{reviews.filter(r => r.isPublished).length}</div>
                            <p className="stat-label">Đã công khai</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                    <Card className="dashboard-card stat-card">
                        <Card.Body>
                            <div className="stat-icon info">
                                <i className="bi bi-reply"></i>
                            </div>
                            <div className="stat-value">{reviews.filter(r => r.mentorReply).length}</div>
                            <p className="stat-label">Đã phản hồi</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col lg={8}>
                    {/* Reviews List */}
                    <Card className="dashboard-card">
                        <Card.Header className="bg-transparent border-0">
                            <h5 className="mb-0">Danh sách đánh giá</h5>
                        </Card.Header>
                        <Card.Body>
                            {reviews.map((review) => (
                                <div key={review.id} className="review-item border rounded-3 p-3 mb-3">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className="d-flex align-items-center">
                                            <div className="avatar-sm me-3">
                                                <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                                    <span className="text-white fw-bold">
                                                        {review.customer.fullname.charAt(0)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <h6 className="mb-0">{review.customer.fullname}</h6>
                                                <small className="text-muted">{review.service}</small>
                                            </div>
                                        </div>
                                        <div className="text-end">
                                            <div className="mb-1">
                                                {renderStars(review.rating)}
                                                <span className="ms-2 fw-bold">{review.rating}/5</span>
                                            </div>
                                            <small className="text-muted">{formatDateTime(review.created_at)}</small>
                                        </div>
                                    </div>

                                    <div className="review-content mb-3">
                                        <p className="mb-0">{review.comment}</p>
                                    </div>

                                    {review.mentorReply && (
                                        <div className="mentor-reply bg-light rounded-3 p-3 mb-3">
                                            <div className="d-flex align-items-center mb-2">
                                                <i className="bi bi-reply me-2 text-primary"></i>
                                                <strong className="text-primary">Phản hồi của bạn:</strong>
                                                <small className="text-muted ms-auto">
                                                    {formatDateTime(review.mentorReply.created_at)}
                                                </small>
                                            </div>
                                            <p className="mb-0">{review.mentorReply.content}</p>
                                        </div>
                                    )}

                                    <div className="review-actions d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center gap-3">
                                            <Badge bg={review.isPublished ? 'success' : 'secondary'}>
                                                {review.isPublished ? 'Đã công khai' : 'Chưa công khai'}
                                            </Badge>
                                            {review.mentorReply && (
                                                <Badge bg="info">Đã phản hồi</Badge>
                                            )}
                                        </div>
                                        <div className="d-flex gap-2">
                                            {!review.mentorReply && (
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() => handleReplyReview(review)}
                                                >
                                                    <i className="bi bi-reply me-1"></i>
                                                    Phản hồi
                                                </Button>
                                            )}
                                            <Button
                                                variant={review.isPublished ? 'outline-warning' : 'outline-success'}
                                                size="sm"
                                                onClick={() => handleTogglePublish(review.id, review.isPublished)}
                                            >
                                                <i className={`bi bi-eye${review.isPublished ? '-slash' : ''} me-1`}></i>
                                                {review.isPublished ? 'Ẩn' : 'Công khai'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    {/* Rating Overview */}
                    <Card className="dashboard-card mb-3">
                        <Card.Header className="bg-transparent border-0">
                            <h5 className="mb-0">Tổng quan đánh giá</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="text-center mb-4">
                                <div className="display-4 fw-bold text-primary">{getAverageRating()}</div>
                                <div className="mb-2">
                                    {renderStars(Math.round(parseFloat(getAverageRating())))}
                                </div>
                                <small className="text-muted">Dựa trên {totalReviews} đánh giá</small>
                            </div>

                            <div className="rating-breakdown">
                                {[5, 4, 3, 2, 1].map(star => (
                                    <div key={star} className="d-flex align-items-center mb-2">
                                        <span className="me-2 small">{star}</span>
                                        <i className="bi bi-star-fill text-warning me-2"></i>
                                        <div className="progress flex-grow-1 me-2" style={{ height: '6px' }}>
                                            <div
                                                className="progress-bar bg-warning"
                                                style={{ width: `${(ratingDistribution[star] / totalReviews) * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="small text-muted">{ratingDistribution[star]}</span>
                                    </div>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Recent Feedback */}
                    <Card className="dashboard-card">
                        <Card.Header className="bg-transparent border-0">
                            <h5 className="mb-0">Phản hồi gần đây</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="recent-feedback">
                                {reviews.slice(0, 3).map((review) => (
                                    <div key={review.id} className="feedback-item mb-3 pb-3 border-bottom">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <small className="fw-medium">{review.customer.fullname}</small>
                                            <div className="text-end">
                                                {renderStars(review.rating)}
                                            </div>
                                        </div>
                                        <p className="small text-muted mb-0">
                                            {review.comment.length > 80
                                                ? review.comment.substring(0, 80) + '...'
                                                : review.comment
                                            }
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Reply Modal */}
            <Modal show={showReplyModal} onHide={() => setShowReplyModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Phản hồi đánh giá</Modal.Title>
                </Modal.Header>
                {selectedReview && (
                    <Modal.Body>
                        <Card className="mb-3">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <h6 className="mb-1">{selectedReview.customer.fullname}</h6>
                                        <small className="text-muted">{selectedReview.service}</small>
                                    </div>
                                    <div className="text-end">
                                        {renderStars(selectedReview.rating)}
                                        <span className="ms-2">{selectedReview.rating}/5</span>
                                    </div>
                                </div>
                                <p className="mb-0">{selectedReview.comment}</p>
                            </Card.Body>
                        </Card>

                        <Form>
                            <Form.Group>
                                <Form.Label>Phản hồi của bạn <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    placeholder="Viết phản hồi của bạn cho đánh giá này..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                />
                                <Form.Text className="text-muted">
                                    Phản hồi của bạn sẽ được hiển thị công khai cùng với đánh giá này.
                                </Form.Text>
                            </Form.Group>
                        </Form>

                        <Alert variant="info" className="mt-3">
                            <i className="bi bi-info-circle me-2"></i>
                            Hãy trả lời một cách chuyên nghiệp và lịch sự. Phản hồi tích cực sẽ giúp tăng uy tín của bạn.
                        </Alert>
                    </Modal.Body>
                )}
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowReplyModal(false)}>
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmitReply}
                        disabled={!replyText.trim()}
                    >
                        <i className="bi bi-send me-2"></i>
                        Gửi phản hồi
                    </Button>
                </Modal.Footer>
            </Modal>

            <style jsx>{`
                .review-item {
                    transition: all 0.3s ease;
                }
                
                .review-item:hover {
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                    transform: translateY(-2px);
                }
                
                .mentor-reply {
                    border-left: 4px solid var(--primary-color);
                }
                
                .progress {
                    background-color: rgba(0, 0, 0, 0.1);
                }
                
                .feedback-item:last-child {
                    border-bottom: none !important;
                }
            `}</style>
        </div>
    );
};

export default ReviewManagement;
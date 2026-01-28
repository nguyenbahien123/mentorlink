import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { FaStar } from 'react-icons/fa';
import axios from 'axios';
import { authInstance } from '../../api/axios';
import './BookingReview.css';

/**
 * Component để xử lý đánh giá buổi học
 * URL: /review?token=xxx
 */
const BookingReview = ({ showToast }) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    // Provide a safe fallback when parent does not pass showToast
    const safeShowToast = typeof showToast === 'function'
        ? showToast
        : (message, level = 'info') => {
            // Minimal fallback: use console for dev, alert for errors
            if (level === 'error' || level === 'danger') {
                // eslint-disable-next-line no-alert
                alert(message);
            } else {
                // keep console output for non-blocking messages
                // eslint-disable-next-line no-console
                console.log(`[${level}] ${message}`);
            }
        };

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Thông tin booking từ token validation
    const [bookingInfo, setBookingInfo] = useState(null);

    // Form data
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');

    // Validate token khi component mount
    useEffect(() => {
        validateToken();
    }, []);

    /**
     * Validate review token
     */
    const validateToken = async () => {
        setLoading(true);
        setError(null);

        if (!token) {
            setError('Token không hợp lệ. Vui lòng kiểm tra lại link.');
            setLoading(false);
            return;
        }

        try {
            const response = await authInstance.get(`/api/booking/review/validate?token=${encodeURIComponent(token)}`);

            if (response && response.respCode === '0' && response.data) {
                setBookingInfo(response.data);
                setLoading(false);
            } else {
                setError(response?.description || 'Token không hợp lệ hoặc đã hết hạn.');
                setLoading(false);
            }
        } catch (err) {
            console.error('Error validating token:', err);
            setError('Có lỗi xảy ra khi xác thực token. Vui lòng thử lại.');
            setLoading(false);
        }
    };

    /**
     * Submit đánh giá
     */
    const handleSubmitReview = async (e) => {
        e.preventDefault();

        // Validate form
        if (!rating || rating === 0) {
            safeShowToast('Vui lòng chọn số sao', 'warning');
            return;
        }

        if (!comment.trim()) {
            safeShowToast('Vui lòng nhập nội dung đánh giá', 'warning');
            return;
        }

        if (comment.trim().length < 10) {
            safeShowToast('Nội dung đánh giá phải có ít nhất 10 ký tự', 'warning');
            return;
        }

        setSubmitting(true);

        try {
            const baseRequest = {
                requestDateTime: new Date().toISOString(),
                data: {
                    token: token,
                    rating: rating,
                    comment: comment.trim()
                }
            };

            const response = await authInstance.post('/api/booking/review/submit', baseRequest);

            if (response && response.respCode === '0') {
                setSuccess(true);
                safeShowToast(response.description || 'Cảm ơn bạn đã đánh giá!', 'success');

                // Chuyển hướng về trang chủ sau 3 giây
                setTimeout(() => {
                    navigate('/');
                }, 3000);
            } else {
                safeShowToast(response.data?.description || 'Lỗi khi lưu đánh giá', 'error');
            }
        } catch (err) {
            console.error('Error submitting review:', err);
            safeShowToast('Có lỗi xảy ra. Vui lòng thử lại.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    /**
     * Render star rating component
     */
    const renderStarRating = () => {
        return (
            <div className="star-rating-wrapper">
                <div className="star-rating-display">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className={`star-button ${star <= (hoveredRating || rating) ? 'active' : ''}`}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                        >
                            <FaStar size={32} />
                        </button>
                    ))}
                </div>
                <div className="rating-text">
                    {rating > 0 && (
                        <span>
                            Bạn đã chọn <strong>{rating}</strong> sao
                            <span className="rating-label">
                                {rating === 1 && ' - Chưa đạt kỳ vọng'}
                                {rating === 2 && ' - Tạm được, nhưng cần cải thiện'}
                                {rating === 3 && ' - Bình thường'}
                                {rating === 4 && ' - Tốt, rất hài lòng'}
                                {rating === 5 && ' - Xuất sắc, vượt mong đợi'}
                            </span>
                        </span>
                    )}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <Container className="booking-review-container py-5">
                <div className="text-center">
                    <Spinner animation="border" role="status" className="text-primary">
                        <span className="visually-hidden">Đang tải...</span>
                    </Spinner>
                    <p className="mt-3 text-muted">Đang xác thực token...</p>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="booking-review-container py-5">
                <Row className="justify-content-center">
                    <Col md={6}>
                        <Card className="shadow-sm border-danger">
                            <Card.Body className="text-center py-5">
                                <h5 className="text-danger mb-3">❌ Không Thể Đánh Giá</h5>
                                <p className="text-muted">{error}</p>
                                <Button
                                    variant="primary"
                                    onClick={() => navigate('/')}
                                    className="mt-3"
                                >
                                    Về Trang Chủ
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }

    if (success) {
        return (
            <Container className="booking-review-container py-5">
                <Row className="justify-content-center">
                    <Col md={6}>
                        <Card className="shadow-sm border-success">
                            <Card.Body className="text-center py-5">
                                <h5 className="text-success mb-3">✅ Cảm Ơn Bạn!</h5>
                                <p className="text-muted">
                                    Đánh giá của bạn đã được ghi nhận. Bạn sẽ được chuyển về trang chủ ngay.
                                </p>
                                <Button
                                    variant="primary"
                                    onClick={() => navigate('/')}
                                    className="mt-3"
                                >
                                    Về Trang Chủ
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }

    return (
        <Container className="booking-review-container py-5">
            <Row className="justify-content-center">
                <Col lg={8}>
                    <Card className="shadow-sm booking-review-card">
                        {/* Header */}
                        <Card.Header className="bg-primary text-white py-4">
                            <h4 className="mb-0">⭐ Đánh Giá Buổi Học</h4>
                        </Card.Header>

                        <Card.Body className="p-4">
                            {/* Booking Info */}
                            {bookingInfo && (
                                <div className="booking-info-section mb-4">
                                    <div className="info-row">
                                        <span className="info-label">Mentor:</span>
                                        <span className="info-value">{bookingInfo.mentorName}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Dịch vụ:</span>
                                        <span className="info-value">{bookingInfo.serviceName}</span>
                                    </div>
                                </div>
                            )}

                            <hr />

                            <Form onSubmit={handleSubmitReview}>
                                {/* Rating Section */}
                                <Form.Group className="mb-4">
                                    <Form.Label className="mb-3 fw-bold">
                                        Đánh giá của bạn <span className="text-danger">*</span>
                                    </Form.Label>
                                    {renderStarRating()}
                                </Form.Group>

                                {/* Comment Section */}
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-bold">
                                        Nội dung đánh giá <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={5}
                                        placeholder="Hãy chia sẻ ý kiến của bạn về buổi học này...
- Kiến thức và chuyên môn
- Phương pháp giảng dạy
- Tính chuyên nghiệp
- Tính hữu dụng"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        maxLength={1000}
                                        className="booking-review-textarea"
                                    />
                                    <small className="text-muted d-block mt-2">
                                        {comment.length}/1000 ký tự
                                    </small>
                                </Form.Group>

                                {/* Validation Alert */}
                                {(rating === 0 || !comment.trim()) && (
                                    <Alert variant="warning" className="small">
                                        <div>Vui lòng:</div>
                                        <ul className="mb-0 mt-2">
                                            {rating === 0 && <li>Chọn số sao đánh giá</li>}
                                            {!comment.trim() && <li>Nhập nội dung đánh giá (tối thiểu 10 ký tự)</li>}
                                        </ul>
                                    </Alert>
                                )}

                                {/* Submit Button */}
                                <div className="d-grid gap-2">
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        size="lg"
                                        disabled={submitting || rating === 0 || !comment.trim()}
                                    >
                                        {submitting ? (
                                            <>
                                                <Spinner
                                                    as="span"
                                                    animation="border"
                                                    size="sm"
                                                    role="status"
                                                    aria-hidden="true"
                                                    className="me-2"
                                                />
                                                Đang gửi...
                                            </>
                                        ) : (
                                            'Gửi Đánh Giá'
                                        )}
                                    </Button>
                                </div>

                                {/* Secondary Button */}
                                <Button
                                    variant="outline-secondary"
                                    type="button"
                                    className="w-100 mt-2"
                                    onClick={() => navigate('/')}
                                    disabled={submitting}
                                >
                                    Hủy
                                </Button>
                            </Form>
                        </Card.Body>

                        {/* Footer Info */}
                        <Card.Footer className="bg-light text-muted py-3 text-center">
                            <small>
                                Đánh giá của bạn sẽ được duyệt trước khi công khai. Cảm ơn đã góp ý! 🙏
                            </small>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default BookingReview;
